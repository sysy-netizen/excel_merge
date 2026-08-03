# -*- coding: utf-8 -*-
"""
file_reader.py
===============
A파일(네이버), B파일(로젠) 엑셀을 '읽기만' 담당하는 파일입니다.
암호 풀기, 엑셀 로딩 같은 입구 역할만 하고, 계산/매칭 로직은 없습니다.

excel_merge/file_reader.py 를 그대로 이식한 파일입니다.
"""

import io
import msoffcrypto
import pandas as pd

from . import config


def read_a_file(source) -> pd.DataFrame:
    """
    A파일(네이버 다운로드 파일)을 읽습니다.
    암호가 걸려 있으므로 먼저 비밀번호로 잠금을 해제한 뒤 읽습니다.
    반환값은 헤더 없이(raw) 읽은 전체 표입니다. (행/열 번호로 접근)

    source: 파일 경로(str) 또는 이미 열려 있는 파일 객체(예: 업로드 파일) 둘 다 가능합니다.
    """
    if hasattr(source, "read"):
        return _decrypt_and_read(source)

    with open(source, "rb") as f:
        return _decrypt_and_read(f)


def _decrypt_and_read(fileobj) -> pd.DataFrame:
    office_file = msoffcrypto.OfficeFile(fileobj)
    office_file.load_key(password=config.A_FILE_PASSWORD)
    decrypted = io.BytesIO()
    office_file.decrypt(decrypted)
    decrypted.seek(0)
    return pd.read_excel(decrypted, header=None)


def read_b_file(source) -> pd.DataFrame:
    """
    B파일(로젠택배 다운로드 파일)을 읽습니다.
    암호는 없고, 헤더가 2줄짜리 병합 구조라서 header=None으로 통째로 읽고
    데이터 시작 행은 config.B_DATA_START_ROW 로 잘라서 사용합니다.

    source: 파일 경로(str) 또는 이미 열려 있는 파일 객체 둘 다 가능합니다.
    """
    return pd.read_excel(source, header=None)
