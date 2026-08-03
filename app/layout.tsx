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
      <body>{children}</body>
    </html>
  );
}
