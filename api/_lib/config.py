# -*- coding: utf-8 -*-
"""
config.py
=========
프로그램 전체에서 쓰는 '고정값'을 모아둔 파일입니다.
파일 경로, 엑셀 컬럼 위치, 암호, 고정 문구 등이 바뀔 때는
이 파일 하나만 고치면 됩니다. (다른 파일은 건드릴 필요 없음)

excel_merge/config.py 를 그대로 이식한 파일입니다.
"""


# ── A파일 (네이버 다운로드 파일) 설정 ──────────────────────────────
A_FILE_PASSWORD = "1234"          # 네이버 파일 암호
A_DATA_START_ROW = 2              # 실제 데이터가 시작하는 행 (0부터 세는 인덱스, 엑셀상 3행)

A_COL_PRODUCT_ORDER_NO = 0        # A열: 상품주문번호
A_COL_ORDER_NO = 1                # B열: 주문번호 (그룹핑 기준)
A_COL_NAME = 13                   # N열: 수취인명
A_COL_PHONE = 48                  # AW열: 구매자연락처


# ── B파일 (로젠택배 다운로드 파일) 설정 ────────────────────────────
B_DATA_START_ROW = 3              # 실제 데이터가 시작하는 행 (0부터 세는 인덱스, 엑셀상 4행)

B_COL_INVOICE_NO = 3              # D열: 운송장번호
B_COL_ORDER_NO_KEY = 18           # S열: 주문번호 (A파일 상품주문번호와 1차 매칭되는 열)
B_COL_NAME = 6                    # G열: 이름(수하인) - 3차 매칭 그룹열
B_COL_PHONE_TEL = 9                # J열: 전화(마스킹된 연락처) - 3차 매칭 그룹열
B_COL_PHONE = 10                  # K열: 휴대폰(마스킹된 연락처) - 3차 매칭 그룹열


# ── C파일 (결과 파일) 설정 ─────────────────────────────────────────
C_SHEET_NAME = "발송처리"
C_OUTPUT_FILENAME = "excelUploadSample.xls"   # 구버전 xls 고정

C_HEADERS = ["상품주문번호", "배송방법", "택배사", "송장번호"]

# B열, C열은 데이터별로 달라지는 값이 아니라 항상 같은 문구로 채워집니다.
C_FIXED_DELIVERY_METHOD = "택배,등기,소포"     # B열 고정값
C_FIXED_COURIER = "로젠택배"                    # C열 고정값
