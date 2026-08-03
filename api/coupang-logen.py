# -*- coding: utf-8 -*-
"""
api/coupang-logen.py
======================
쿠팡 윙 x 로젠택배 변환 엔드포인트 (POST /api/coupang-logen).

프론트엔드에서 multipart/form-data로 "coupang", "logen" 두 파일을 보내면,
excel_merge의 기존 매칭 로직(_lib/file_reader, _lib/coupang_logen)을 그대로
호출해 결과를 JSON으로 돌려줍니다.

업로드된 파일은 디스크에 저장하지 않고 메모리에서만 처리합니다.
"""

import base64
import os
import sys

from flask import Flask, jsonify, request

sys.path.append(os.path.dirname(__file__))
from _lib import coupang_logen, file_reader  # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB


@app.route("/api/coupang-logen", methods=["POST"])
def coupang_logen_route():
    coupang_file = request.files.get("coupang")
    logen_file = request.files.get("logen")

    if not coupang_file or not logen_file:
        return jsonify({
            "success": False,
            "error": "쿠팡 파일과 로젠 파일을 모두 업로드해주세요.",
        })

    try:
        coupang_df = coupang_logen.read_coupang_file(coupang_file)
        b_df = file_reader.read_b_file(logen_file)

        result_df, total, stage1, stage2, unmatched_count, unmatched_orders = (
            coupang_logen.match_coupang_logen(coupang_df, b_df)
        )

        stats = {
            "total": total,
            "stage1": stage1,
            "stage2": stage2,
            "unmatched": unmatched_count,
        }

        if unmatched_count:
            return jsonify({
                "success": False,
                "error": (
                    f"운송장번호가 매칭되지 않은 주문번호가 {unmatched_count}건 있습니다. "
                    "아래 목록을 확인한 뒤 원본 파일을 점검하고 다시 시도해주세요."
                ),
                "stats": stats,
                "unmatched": unmatched_orders,
            })

        buffer = coupang_logen.write_coupang_file_to_buffer(result_df)
        file_base64 = base64.b64encode(buffer.read()).decode("ascii")

        return jsonify({
            "success": True,
            "stats": stats,
            "filename": "Coupang_완성본.xlsx",
            "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "fileBase64": file_base64,
        })

    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": f"오류가 발생했습니다: {e}"})
