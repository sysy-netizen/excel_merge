# 대량발송 파일 변환기 (Vercel 배포용)

`excel_merge/`(Streamlit 버전)를 Vercel에서 돌아가도록 재작성한 프로젝트입니다.

- 화면: Next.js (App Router, TypeScript)
- 매칭 로직: Python (Vercel Python 서버리스 함수, `/api/*.py`) — 기존
  `excel_merge/`의 `config.py / file_reader.py / key_builder.py / matcher.py /
  writer.py / coupang_logen.py` 로직을 그대로 이식 (`api/_lib/`)

`codivostudio-web`(Astro, Cloudflare 배포)의 `/tools/rank-tracker/`,
`/tools/keyword-analysis/`와 같은 방식으로, `codivostudio-web` 쪽 페이지가
이 앱을 `<iframe>`으로 감싸서 보여줍니다. 그래서 이 앱은 자체 공통
헤더/페이지 제목을 렌더링하지 않습니다 (감싸는 쪽 `ProgramLayout`이 이미
렌더링하므로 중복 방지) — 변환 도구 UI만 담당합니다.

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
3. 배포 후 나오는 주소(예: `https://excel-merge-xxxx.vercel.app`)를
   `codivostudio-web` 저장소의 `src/pages/tools/excel-converter/index.astro`
   iframe `src`와 `src/data/programs.ts`에 반영해야 실제 사이트에서 보입니다.

## 구조

```
api/
  naver-logen.py     # POST /api/naver-logen  (네이버 x 로젠)
  coupang-logen.py   # POST /api/coupang-logen (쿠팡 x 로젠)
  _lib/               # 매칭 로직 (excel_merge/*.py 원본 그대로 이식)
app/
  page.tsx            # 메인 화면 (마켓플레이스/택배사 선택 UI만 렌더링)
  components/         # 마켓플레이스/택배사 선택 UI, 업로드-변환 패널
public/logo/          # 마켓플레이스/택배사 로고
```

## 참고

- 업로드된 엑셀 파일은 디스크에 저장하지 않고 메모리에서만 처리한 뒤
  즉시 사라집니다 (기존 Streamlit 버전과 동일한 정책).
- Python 함수 `maxDuration`/`memory`는 `vercel.json`에서 조정할 수 있습니다
  (대용량 파일 처리 시 타임아웃이 발생하면 값을 늘려주세요. 플랜별 상한 있음).
