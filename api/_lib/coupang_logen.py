# -*- coding: utf-8 -*-
"""
coupang_logen.py
=================
쿠팡 윙 x 로젠택배 전용 매칭 로직입니다.
네이버 x 로젠택배(matcher.py)와는 완전히 다른 파일이라, 여기 로직을 고쳐도
네이버 쪽에는 전혀 영향이 없습니다.

규칙:
    1차 매칭:
        - 쿠팡 파일의 C열(주문번호) 값을 기준으로,
          로젠 파일의 S열(주문번호)에서 같은 값을 찾음
        - 찾으면, 그 로젠 파일 행의 D열(운송장번호) 값을
          쿠팡 파일의 E열(운송장번호)에 채워 넣음

    2차 매칭 (1차 실패 시):
        - 쿠팡 파일의 AA열(수취인이름) + AB열(수취인전화번호 앞부분, 마지막 4자리 제외)을
          구분자 없이 그대로 이어붙여 그룹값을 만듦 (예: "임상일" + "0502-4682" -> "임상일0502-4682")
        - 로젠 파일의 G열(이름) + K열(휴대폰, 마지막 4자리 제외)도 같은 방식으로 그룹값을 만듦
        - 두 그룹값이 같으면, 그 로젠 파일 행의 D열(운송장번호) 값을 가져와 채움

    1차, 2차 모두 실패하면 미매칭으로 표시합니다.

    결과 파일은 쿠팡 원본 파일의 모든 컬럼을 그대로 유지한 채
    E열(운송장번호)만 채워서 저장합니다. (네이버처럼 4개 컬럼만 뽑지 않음)

로젠 파일을 읽는 부분은 file_reader.read_b_file() / config.py의
B_DATA_START_ROW, B_COL_INVOICE_NO, B_COL_ORDER_NO_KEY, B_COL_NAME, B_COL_PHONE 값을
그대로 재사용합니다. (로젠 파일 구조는 어느 마켓플레이스와 조합하든 동일하기 때문)

excel_merge/coupang_logen.py 를 그대로 이식한 파일입니다.
"""

import io

import pandas as pd

from . import config

# 쿠팡 파일 컬럼 위치 (0부터 세는 인덱스)
COUPANG_COL_ORDER_NO = 2      # C열: 주문번호 (1차 매칭 키)
COUPANG_COL_INVOICE_NO = 4    # E열: 운송장번호 (채울 대상)
COUPANG_COL_NAME = 26         # AA열: 수취인이름 (2차 매칭용)
COUPANG_COL_PHONE = 27        # AB열: 수취인전화번호 (2차 매칭용)

COUPANG_SHEET_NAME = "Sheet1"


def read_coupang_file(source) -> pd.DataFrame:
    """
    쿠팡 파일을 읽습니다. (암호 없음, 첫 줄이 바로 헤더)
    source: 파일 경로(str) 또는 이미 열려 있는 파일 객체(예: 업로드 파일) 둘 다 가능합니다.
    """
    df = pd.read_excel(source, header=0, dtype=str)
    df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
    return df


def _clean(value) -> str:
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    return text


def _phone_prefix(phone: str) -> str:
    """전화번호에서 마지막 4자리(개인 고유번호)를 제외한 앞부분만 남깁니다."""
    parts = phone.split("-")
    if len(parts) >= 2:
        return "-".join(parts[:2])
    return phone


def _make_group_key(name: str, phone: str) -> str:
    """이름과 전화번호 앞부분을 구분자 없이 그대로 이어붙입니다."""
    return f"{name}{_phone_prefix(phone)}"


def _build_logen_lookups(b_df: pd.DataFrame):
    """
    로젠 파일을 한 번 훑어서, 1차용 사전과 2차용 사전을 동시에 만듭니다.
        - order_lookup: {주문번호: 운송장번호}
        - group_lookup: {이름+전화번호앞부분: 운송장번호}
    중복이면 먼저 나온 값을 사용합니다.
    """
    data = b_df.iloc[config.B_DATA_START_ROW:].reset_index(drop=True)

    order_lookup = {}
    group_lookup = {}

    for i in range(len(data)):
        invoice_no = _clean(data.iloc[i, config.B_COL_INVOICE_NO])
        order_no = _clean(data.iloc[i, config.B_COL_ORDER_NO_KEY])
        name = _clean(data.iloc[i, config.B_COL_NAME])
        phone = _clean(data.iloc[i, config.B_COL_PHONE])

        if order_no and order_no not in order_lookup:
            order_lookup[order_no] = invoice_no

        group_key = _make_group_key(name, phone)
        if group_key not in group_lookup:
            group_lookup[group_key] = invoice_no

    return order_lookup, group_lookup


def match_coupang_logen(coupang_df: pd.DataFrame, b_df: pd.DataFrame):
    """
    쿠팡 파일과 로젠 파일을 매칭해서, 로젠 D열 값을 쿠팡 E열에 채웁니다.
    1차(주문번호 직접 매칭)로 안 되면 2차(이름+전화번호 그룹)로 재시도합니다.

    반환값: (결과 DataFrame, 전체 건수, 1차 매칭 건수, 2차 매칭 건수, 미매칭 건수, 미매칭 주문번호 목록)
    """
    order_lookup, group_lookup = _build_logen_lookups(b_df)
    result_df = coupang_df.copy()
    # 운송장번호 열이 원본 파일에서 전부 빈 값일 경우 숫자형(float)으로 인식될 수 있어,
    # 문자열 운송장번호를 넣기 전에 미리 문자형(object)으로 바꿔둡니다.
    invoice_col = result_df.columns[COUPANG_COL_INVOICE_NO]
    result_df[invoice_col] = result_df[invoice_col].astype(object)

    unmatched_orders = []
    stage1_count = 0
    stage2_count = 0

    for i in range(len(result_df)):
        order_no = _clean(result_df.iat[i, COUPANG_COL_ORDER_NO])
        invoice_no = order_lookup.get(order_no)

        if invoice_no:
            result_df.iat[i, COUPANG_COL_INVOICE_NO] = invoice_no
            stage1_count += 1
            continue

        name = _clean(result_df.iat[i, COUPANG_COL_NAME])
        phone = _clean(result_df.iat[i, COUPANG_COL_PHONE])
        group_key = _make_group_key(name, phone)
        invoice_no = group_lookup.get(group_key)

        if invoice_no:
            result_df.iat[i, COUPANG_COL_INVOICE_NO] = invoice_no
            stage2_count += 1
        else:
            unmatched_orders.append(order_no)

    total = len(result_df)
    matched_count = stage1_count + stage2_count
    unmatched_count = total - matched_count
    return result_df, total, stage1_count, stage2_count, unmatched_count, unmatched_orders


def write_coupang_file_to_buffer(coupang_df: pd.DataFrame) -> io.BytesIO:
    """디스크에 저장하지 않고, 메모리(BytesIO)에만 결과 엑셀을 만들어 돌려줍니다."""
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        coupang_df.to_excel(writer, index=False, sheet_name=COUPANG_SHEET_NAME)
    buffer.seek(0)
    return buffer
