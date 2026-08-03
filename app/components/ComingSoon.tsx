export default function ComingSoon({
  marketplace,
  courier,
}: {
  marketplace: string;
  courier: string;
}) {
  return (
    <div className="cs-tool">
      <h2>
        {marketplace} × {courier}
      </h2>
      <div className="cs-coming-soon">
        🚧 아직 서비스 준비 중입니다. 완성되는 대로 이 자리에서 바로 이용하실 수 있어요.
      </div>
    </div>
  );
}
