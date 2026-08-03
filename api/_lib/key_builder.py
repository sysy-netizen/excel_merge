# -*- coding: utf-8 -*-
"""
key_builder.py
===============
A파일(N파일/네이버)의 원본 행을 그대로 읽어서 목록으로 만드는 파일입니다.

A열(상품주문번호)은 원본 그대로 전부 남깁니다. (더 이상 주문번호 기준으로
중복을 제거하지 않습니다 - 최종 결과에는 A파일의 모든 행이 그대로 나와야 합니다.)

B열(주문번호)은 버리지 않고 함께 담아 두는데, matcher.py의 2차 보정 단계에서
"같은 주문번호(B열) 그룹끼리 운송장번호를 공유"하는 데 그룹 기준값으로 씁니다.

N열(수취인명), AW열(수취인연락처1)도 함께 담아 두는데, matcher.py의 3차 보정
단계(수취인 정보 매칭)에서 J파일의 이름/연락처와 대조하는 데 씁니다.

excel_merge/key_builder.py 를 그대로 이식한 파일입니다.
"""

from typing import List, Dict
import pandas as pd

from . import config


def _clean(value) -> str:
    """
    셀 값을 문자열로 통일합니다.
    엑셀 숫자가 '123456.0' 처럼 읽히는 경우를 방지하기 위해
    소수점 이하를 제거합니다.
    """
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    return text


def build_key_rows(a_df: pd.DataFrame) -> List[Dict]:
    """
    A파일 원본 표(raw DataFrame)를 받아서, 전체 행 목록을 돌려줍니다.
    (중복 제거 없음 - A파일에 있는 행 수 그대로 반환)

    반환되는 각 항목:
        {
            "상품주문번호": "...",   # A열 값 (C파일 A열이 됨)
            "주문번호": "...",       # B열 값 (2차 보정 그룹 기준값, 최종 출력에는 미포함)
            "이름": "...",           # N열 값 (3차 보정용, 최종 출력에는 미포함)
            "연락처": "...",         # AW열 값 (3차 보정용, 최종 출력에는 미포함)
        }
    """
    data = a_df.iloc[config.A_DATA_START_ROW:].reset_index(drop=True)

    key_rows: List[Dict] = []

    for i in range(len(data)):
        key_rows.append({
            "상품주문번호": _clean(data.iloc[i, config.A_COL_PRODUCT_ORDER_NO]),
            "주문번호": _clean(data.iloc[i, config.A_COL_ORDER_NO]),
            "이름": _clean(data.iloc[i, config.A_COL_NAME]),
            "연락처": _clean(data.iloc[i, config.A_COL_PHONE]),
        })

    return key_rows
