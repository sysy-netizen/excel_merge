import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "대량발송 파일 변환기 | Codivo Studio",
  description:
    "네이버 · 쿠팡 주문내역 엑셀파일을 택배사 송장번호 엑셀파일과 자동으로 매칭해, 대량발송용 엑셀 파일로 변환해 드립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <nav className="cs-program-nav" aria-label="Seller Tools 프로그램">
          <ul>
            <li>
              <a className="cs-program-link" href="/tools/all-tools/">
                전체도구
              </a>
            </li>
            <li>
              <a className="cs-program-link cs-program-link--active" href="/tools/excel-converter/" aria-current="page">
                엑셀변환기
              </a>
            </li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}
