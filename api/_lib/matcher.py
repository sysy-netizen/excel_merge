# -*- coding: utf-8 -*-
"""
matcher.py
===========
N파일(네이버, key_rows) 행에 J파일(로젠)의 운송장번호를 짝지어주는(매칭) 파일입니다.

매칭은 3단계로 진행하며, 앞 단계에서 이미 채워진 행은 뒤 단계에서 건드리지 않습니다.

1차 매칭(직접 매칭): N파일 A열(상품주문번호) == J파일 S열(주문번호) → 같으면
                      그 행의 J파일 D열(운송장번호)을 사용합니다.
                      J파일 S열에 중복된 주문번호가 있으면 첫 번째 값만 사용합니다.

2차 보정(그룹 매칭): 1차에서 못 채운 행에 대해, N파일 B열(주문번호, 부모 키)이
                      같은 다른 행들 중 이미 D열 값이 채워진 행이 있으면 그 값을
                      그대로 복사합니다. 판단 기준은 행의 위치가 아니라 B열 값이
                      같은지 여부이며, 정렬 순서와 무관하게 같은 그룹이면 값을 공유합니다.

3차 보정(수취인 정보 매칭): 1차·2차 모두 실패한 행에 대해서만, N파일의
                      이름(N열)+연락처(AW열)와 J파일의 이름(G열)+전화(J열) 또는
                      휴대폰(K열)이 같은 행을 찾아 그 D열 값을 사용합니다.
                      J파일 연락처는 뒷자리가 마스킹(****)되어 있으므로, 마스킹
                      되지 않은 앞부분만 잘라서 비교합니다.
                      (동일 이름+연락처 조합이 J파일에 2건 이상 있으면 먼저 나온
                      행을 사용합니다 - 실제 데이터에서 이 케이스가 나오면 별도 확인 필요)

3단계를 모두 거쳐도 값이 없는 행은 빈 값(None)으로 남기고 '미매칭'으로 표시합니다.

excel_merge/matcher.py 를 그대로 이식한 파일입니다.
"""

from typing import List, Dict, Optional
import pandas as pd

from . import config


def _clean(value) -> str:
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    return text


def _phone_prefix(phone: str) -> str:
    """
    전화번호에서 마지막 구간(마스킹되는 개인 고유번호 자리)을 제외한
    앞부분만 남깁니다.
    예) "010-5049-3305"  -> "010-5049"   (N파일, 마스킹 없음)
        "010-5049-****"  -> "010-5049"   (J파일, 뒷자리 마스킹)
    앞부분만 비교해야 마스킹 여부와 무관하게 같은 번호인지 판단할 수 있습니다.
    """
    parts = phone.split("-")
    if len(parts) >= 2:
        return "-".join(parts[:-1])
    return phone


def _make_group_key(name: str, phone: str) -> str:
    return f"{name}&{_phone_prefix(phone)}"


def _build_j_lookup(j_df: pd.DataFrame):
    """
    J파일(로젠) 데이터를 두 종류의 사전(dict)으로 정리합니다.
    - order_no_to_invoice : {S열(주문번호): D열(운송장번호)}                -> 1차 매칭용
    - group_to_invoice    : {이름&연락처앞부분: D열(운송장번호)}             -> 3차 매칭용
      (이름+전화(J열), 이름+휴대폰(K열) 두 조합 모두 키로 등록합니다)
    같은 값이 여러 번 나오면 먼저 나온 값을 사용합니다.
    """
    data = j_df.iloc[config.B_DATA_START_ROW:].reset_index(drop=True)

    order_no_to_invoice: Dict[str, str] = {}
    group_to_invoice: Dict[str, str] = {}

    for i in range(len(data)):
        invoice_no = _clean(data.iloc[i, config.B_COL_INVOICE_NO])
        order_no = _clean(data.iloc[i, config.B_COL_ORDER_NO_KEY])
        name = _clean(data.iloc[i, config.B_COL_NAME])
        tel = _clean(data.iloc[i, config.B_COL_PHONE_TEL])
        mobile = _clean(data.iloc[i, config.B_COL_PHONE])

        if order_no and order_no not in order_no_to_invoice:
            order_no_to_invoice[order_no] = invoice_no

        if name:
            if tel:
                key = _make_group_key(name, tel)
                if key not in group_to_invoice:
                    group_to_invoice[key] = invoice_no
            if mobile:
                key = _make_group_key(name, mobile)
                if key not in group_to_invoice:
                    group_to_invoice[key] = invoice_no

    return order_no_to_invoice, group_to_invoice


def match_all(key_rows: List[Dict], b_df: pd.DataFrame) -> List[Dict]:
    """
    key_rows(N파일 전체 행 목록)와 b_df(J파일)를 매칭합니다.

    반환값: C파일에 그대로 쓸 수 있는 행 목록.
        {
            "상품주문번호": ...,
            "배송방법": 고정값,
            "택배사": 고정값,
            "송장번호": 매칭된 값 또는 None,
            "매칭단계": "1차" / "2차" / "3차" / "미매칭",
        }
    """
    order_no_to_invoice, group_to_invoice = _build_j_lookup(b_df)

    # 1차 매칭: N파일 A열(상품주문번호) == J파일 S열(주문번호)
    results = []
    for row in key_rows:
        product_order_no = row["상품주문번호"]
        invoice_no: Optional[str] = order_no_to_invoice.get(product_order_no) or None

        results.append({
            "상품주문번호": product_order_no,
            "주문번호": row["주문번호"],
            "배송방법": config.C_FIXED_DELIVERY_METHOD,
            "택배사": config.C_FIXED_COURIER,
            "송장번호": invoice_no,
            "매칭단계": "1차" if invoice_no else "미매칭",
        })

    # 2차 보정: 같은 주문번호(N파일 B열) 그룹 안에서, 이미 채워진 운송장번호를
    # 공유합니다. (행 위치가 아니라 B열 값이 같은지로 그룹을 판단합니다)
    group_invoice: Dict[str, str] = {}
    for r in results:
        if r["송장번호"] and r["주문번호"] not in group_invoice:
            group_invoice[r["주문번호"]] = r["송장번호"]

    for r in results:
        if not r["송장번호"]:
            fill = group_invoice.get(r["주문번호"])
            if fill:
                r["송장번호"] = fill
                r["매칭단계"] = "2차"

    # 3차 보정: 1차·2차 모두 실패한 행만 이름+연락처(마스킹 제외 앞부분)로 재시도
    for row, r in zip(key_rows, results):
        if r["송장번호"]:
            continue
        group_key = _make_group_key(row["이름"], row["연락처"])
        fill = group_to_invoice.get(group_key)
        if fill:
            r["송장번호"] = fill
            r["매칭단계"] = "3차"

    return results
