# -*- coding: utf-8 -*-
"""
api/naver-logen.py
====================
네이버 스마트스토어 x 로젠택배 변환 엔드포인트 (POST /api/naver-logen).

프론트엔드에서 multipart/form-data로 "naver", "logen" 두 파일을 보내면,
excel_merge의 기존 매칭 로직(_lib/file_reader, key_builder, matcher, writer)을
그대로 호출해 결과를 JSON으로 돌려줍니다.

업로드된 파일은 디스크에 저장하지 않고 메모리에서만 처리합니다.
"""

import base64
import os
import sys

from flask import Flask, jsonify, request

sys.path.append(os.path.dirname(__file__))
from _lib import config, file_reader, key_builder, matcher, writer  # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB


@app.route("/api/naver-logen", methods=["POST"])
def naver_logen():
    naver_file = request.files.get("naver")
    logen_file = request.files.get("logen")

    if not naver_file or not logen_file:
        return jsonify({
            "success": False,
            "error": "네이버 파일과 로젠 파일을 모두 업로드해주세요.",
        })

    try:
        a_df = file_reader.read_a_file(naver_file)
        b_df = file_reader.read_b_file(logen_file)

        key_rows = key_builder.build_key_rows(a_df)
        results = matcher.match_all(key_rows, b_df)

        stage1 = sum(1 for r in results if r["매칭단계"] == "1차")
        stage2 = sum(1 for r in results if r["매칭단계"] == "2차")
        stage3 = sum(1 for r in results if r["매칭단계"] == "3차")
        unmatched = [r for r in results if r["매칭단계"] == "미매칭"]

        stats = {
            "total": len(results),
            "stage1": stage1,
            "stage2": stage2,
            "stage3": stage3,
            "unmatched": len(unmatched),
        }

        if unmatched:
            return jsonify({
                "success": False,
                "error": (
                    f"운송장번호가 매칭되지 않은 상품주문번호가 {len(unmatched)}건 있습니다. "
                    "아래 목록을 확인한 뒤 원본 파일을 점검하고 다시 시도해주세요."
                ),
                "stats": stats,
                "unmatched": [r["상품주문번호"] for r in unmatched],
            })

        buffer = writer.write_c_file_to_buffer(results)
        file_base64 = base64.b64encode(buffer.read()).decode("ascii")

        return jsonify({
            "success": True,
            "stats": stats,
            "filename": config.C_OUTPUT_FILENAME,
            "mimeType": "application/vnd.ms-excel",
            "fileBase64": file_base64,
        })

    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": f"오류가 발생했습니다: {e}"})
