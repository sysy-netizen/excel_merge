# 대량발송 파일 변환기 (Vercel 배포용)

`excel_merge/`(Streamlit 버전)를 Vercel에서 돌아가도록 재작성한 프로젝트입니다.

- 화면: Next.js (App Router, TypeScript)
- 매칭 로직: Python (Vercel Python 서버리스 함수, `/api/*.py`) — 기존
  `excel_merge/`의 `config.py / file_reader.py / key_builder.py / matcher.py /
  writer.py / coupang_logen.py` 로직을 그대로 이식 (`api/_lib/`)

기존 `excel_merge/`(Streamlit Cloud 배포)는 건드리지 않았습니다. 이 프로젝트는
완전히 별도의 배포 대상입니다.

## 로컬 실행

### 1. 프론트엔드 (Next.js)

```bash
npm install
npm run dev
```

### 2. API 함수 (Python)까지 함께 실행하려면 Vercel CLI 사용

```bash
npm install -g vercel
python -m venv .venv
.venv\Scripts\activate        # (Windows)
pip install -r requirements.txt
vercel dev
```

`vercel dev`는 Next.js 프론트엔드와 `api/*.py` Python 함수를 한 번에
로컬(`http://localhost:3000`)에서 구동합니다.

## 배포 (Vercel)

1. 이 폴더를 GitHub 저장소로 올리거나, `vercel` CLI로 바로 배포합니다.
   ```bash
   vercel login
   vercel --prod
   ```
2. Vercel이 `package.json`을 보고 Next.js 프로젝트로, `requirements.txt` +
   `api/*.py`를 보고 Python 서버리스 함수로 자동 인식합니다.
3. 배포 후 `app/components/Header.tsx`의 "엑셀변환기" 링크를 실제 배포
   주소로 업데이트해주세요 (현재는 `#`로 자기 자신을 가리키도록 되어 있습니다).

## 구조

```
api/
  naver-logen.py     # POST /api/naver-logen  (네이버 x 로젠)
  coupang-logen.py   # POST /api/coupang-logen (쿠팡 x 로젠)
  _lib/               # 매칭 로직 (excel_merge/*.py 원본 그대로 이식)
app/
  page.tsx            # 메인 화면
  components/         # 헤더, 마켓플레이스/택배사 선택 UI, 업로드-변환 패널
public/logo/          # 마켓플레이스/택배사 로고
```

## 참고

- 업로드된 엑셀 파일은 디스크에 저장하지 않고 메모리에서만 처리한 뒤
  즉시 사라집니다 (기존 Streamlit 버전과 동일한 정책).
- Python 함수 `maxDuration`/`memory`는 `vercel.json`에서 조정할 수 있습니다
  (대용량 파일 처리 시 타임아웃이 발생하면 값을 늘려주세요. 플랜별 상한 있음).
