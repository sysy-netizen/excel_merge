const SAMPLE_EMAIL = "kaseycodivo@gmail.com";

export default function ComingSoon({
  marketplace,
  courier,
}: {
  marketplace: string;
  courier: string;
}) {
  const subject = encodeURIComponent(`[운송장 샘플] ${marketplace} × ${courier}`);
  const body = encodeURIComponent(
    "이름·연락처 등 개인정보는 가짜 값으로 바꾼 뒤, 운송장 파일을 첨부해서 보내주세요."
  );
  const mailtoHref = `mailto:${SAMPLE_EMAIL}?subject=${subject}&body=${body}`;

  return (
    <div className="cs-tool">
      <h2>
        {marketplace} × {courier}
      </h2>
      <div className="cs-coming-soon">
        🚧 {courier} 준비 중입니다. 실제 이용하시는 분이 계시면, {courier} 운송장 파일 샘플(이름·연락처 등
        개인정보만 가짜 값으로 바꿔서) {SAMPLE_EMAIL}로 보내주세요 — 확인되는 대로 빠르게 추가해드릴게요.
        <br />
        <a href={mailtoHref} className="cs-coming-soon__link">샘플 파일 보내기 →</a>
      </div>
    </div>
  );
}
