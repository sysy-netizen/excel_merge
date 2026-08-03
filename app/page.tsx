import Header from "./components/Header";
import ToolSelector from "./components/ToolSelector";

export default function Home() {
  return (
    <>
      <Header />
      <main className="cs-page">
        <h1 className="cs-tool-title">📦 대량발송 파일 변환기</h1>
        <p className="cs-tool-desc">
          네이버 · 쿠팡 주문내역 엑셀파일을 택배사 송장번호 엑셀파일과 자동으로 매칭해, 대량발송용
          엑셀 파일로 변환해 드립니다.
        </p>
        <p className="cs-tool-desc">
          네이버 스마트스토어, 쿠팡 윙 셀러를 위한 프로그램입니다. 현재는 로젠택배만 변환이
          가능합니다.
        </p>
        <p className="cs-tool-desc">
          마켓플레이스와 택배사를 선택하면, 그 자리 바로 밑에 변환 도구가 나타납니다.
        </p>

        <ToolSelector />
      </main>
    </>
  );
}
