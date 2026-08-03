# -*- coding: utf-8 -*-
"""
writer.py
==========
매칭이 끝난 결과를 C파일(.xls)로 저장하는 파일입니다.
"저장하기"만 담당합니다.

excel_merge/writer.py 를 이식한 파일입니다. (웹에서는 파일을 디스크에
남기지 않으므로, 콘솔 전용이었던 is_file_locked / write_c_file(디스크 저장)은
제외하고 메모리(BytesIO) 버전만 가져옵니다.)
"""

import io
from typing import List, Dict
import xlwt

from . import config


def _build_workbook(rows: List[Dict]) -> xlwt.Workbook:
    """rows(매칭 결과)로 엑셀 워크북을 만듭니다. (저장은 하지 않음)"""
    wb = xlwt.Workbook(encoding="utf-8")
    ws = wb.add_sheet(config.C_SHEET_NAME)

    for col, header in enumerate(config.C_HEADERS):
        ws.write(0, col, header)

    for row_idx, row in enumerate(rows, start=1):
        ws.write(row_idx, 0, row["상품주문번호"])
        ws.write(row_idx, 1, row["배송방법"])
        ws.write(row_idx, 2, row["택배사"])
        ws.write(row_idx, 3, row["송장번호"] or "")

    return wb


def write_c_file_to_buffer(rows: List[Dict]) -> io.BytesIO:
    """
    rows: matcher.match_all() 이 돌려준 결과 목록
    디스크에 저장하지 않고, 메모리(BytesIO)에만 엑셀을 만들어 돌려줍니다.
    (웹 화면에서 '다운로드'로 바로 내려줄 때 사용 - 서버에 파일을 남기지 않기 위함)
    """
    wb = _build_workbook(rows)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
