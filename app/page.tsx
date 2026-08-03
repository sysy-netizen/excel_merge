import ToolSelector from "./components/ToolSelector";

// codivostudio-web(Astro)의 /tools/excel-converter/ 페이지가 이 앱을 iframe으로
// 감쌉니다. 헤더/제목/설명은 그쪽 ProgramLayout이 이미 렌더링하므로, 여기서는
// 변환 도구 UI만 그립니다 (중복 방지).
export default function Home() {
  return (
    <main className="cs-page">
      <p className="cs-tool-desc">
        마켓플레이스와 택배사를 선택하면, 그 자리 바로 밑에 변환 도구가 나타납니다.
      </p>

      <ToolSelector />
    </main>
  );
}
