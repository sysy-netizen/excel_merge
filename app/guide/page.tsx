import type { Metadata } from "next";
import GuideContent from "../components/GuideContent";

export const metadata: Metadata = {
  title: "엑셀 변환기 이용안내 | Codivo Studio",
  description: "주문 파일 준비부터 송장번호 등록까지, 순서대로 따라 해보세요.",
};

export default function GuidePage() {
  return (
    <main className="cs-page">
      <GuideContent />
    </main>
  );
}
