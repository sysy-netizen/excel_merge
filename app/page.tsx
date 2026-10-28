import ToolSelector from "./components/ToolSelector";

// codivostudio-web(Astro)의 /tools/excel-converter/ 페이지가 이 앱을 iframe으로
// 감쌉니다. 헤더/제목/설명은 그쪽 ProgramLayout이 이미 렌더링하므로, 여기서는
// 변환 도구 UI만 그립니다 (중복 방지).
export default function Home() {
  return (
    <main className="cs-page">
      <ToolSelector />
    </main>
  );
}
