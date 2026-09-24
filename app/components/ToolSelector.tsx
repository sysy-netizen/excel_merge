"use client";

import { useState } from "react";
import ComingSoon from "./ComingSoon";
import NaverLogenPanel from "./converters/NaverLogenPanel";
import CoupangLogenPanel from "./converters/CoupangLogenPanel";

const MARKETPLACES = ["네이버 스마트스토어", "쿠팡 윙"] as const;
const COURIERS = ["로젠택배", "CJ대한통운", "우체국택배", "롯데택배"] as const;

type Marketplace = (typeof MARKETPLACES)[number];
type Courier = (typeof COURIERS)[number];

type TierStatus = "available" | "recruiting" | "none";

// (마켓플레이스, 택배사) -> 무료(병합)/유료(발송자동화) 각각의 진행 상태.
// - free: "available"면 카드에 병합 도구 선택 가능, 그 외("none")면 준비중(ComingSoon) 표시
// - paid: "recruiting"이면 카드에 베타 사전테스트 안내 배지가 뜸, "available"이면 나중에
//   유료 전환 시 사용(지금은 미사용), "none"이면 배지 자체를 안 보여줌
// 새 택배사/새 단계가 열리면 여기 값만 바꾸면 카드에 자동 반영됩니다.
const SERVICES: Record<string, { free: TierStatus; paid: TierStatus }> = {
  "네이버 스마트스토어|로젠택배": { free: "available", paid: "recruiting" },
  "쿠팡 윙|로젠택배": { free: "available", paid: "none" },
};

const DEFAULT_SERVICE = { free: "none", paid: "none" } as const;

const LOGOS: Record<Marketplace, string> = {
  "네이버 스마트스토어": "/tools/excel-converter/logo/naver_logo.png",
  "쿠팡 윙": "/tools/excel-converter/logo/coupang_logo.png",
};

const COURIER_LOGOS: Record<Courier, string> = {
  "로젠택배": "/tools/excel-converter/logo/로젠택배-BI.png",
  "CJ대한통운": "/tools/excel-converter/logo/cj_logo.png",
  "우체국택배": "/tools/excel-converter/logo/우체국_logo.png",
  "롯데택배": "/tools/excel-converter/logo/롯데_logo.png",
};

const ACCENT_COLORS: Record<Marketplace, string> = {
  "네이버 스마트스토어": "rgb(3, 199, 90)",
  "쿠팡 윙": "rgb(61, 172, 220)",
};

function serviceKey(marketplace: string, courier: string) {
  return `${marketplace}|${courier}`;
}

function renderTool(marketplace: Marketplace, courier: Courier) {
  if (marketplace === "네이버 스마트스토어" && courier === "로젠택배") {
    return <NaverLogenPanel />;
  }
  if (marketplace === "쿠팡 윙" && courier === "로젠택배") {
    return <CoupangLogenPanel />;
  }
  return <ComingSoon marketplace={marketplace} courier={courier} />;
}

export default function ToolSelector() {
  const [selected, setSelected] = useState<{ marketplace: Marketplace; courier: Courier } | null>(
    null
  );

  return (
    <>
      {MARKETPLACES.map((marketplace) => (
        <div
          key={marketplace}
          className="cs-group"
          style={{ ["--accent" as string]: ACCENT_COLORS[marketplace] }}
        >
          <div className="cs-group__header">
            <img src={LOGOS[marketplace]} alt={marketplace} />
            <span>{marketplace}</span>
          </div>

          <div className="cs-cards">
            {COURIERS.map((courier) => {
              const service = SERVICES[serviceKey(marketplace, courier)] ?? DEFAULT_SERVICE;
              const available = service.free === "available";
              const isSelected =
                selected?.marketplace === marketplace && selected?.courier === courier;

              return (
                <div className="cs-card" key={courier}>
                  <div className="cs-card__logo-label">
                    <img src={COURIER_LOGOS[courier]} alt={courier} />
                    <span>{courier}</span>
                  </div>
                  <div className="cs-card__status">
                    {available ? "✅ 이용 가능" : "🚧 서비스 예정"}
                  </div>
                  <button
                    type="button"
                    className={`cs-card__button${isSelected ? " is-selected" : ""}`}
                    onClick={() => setSelected({ marketplace, courier })}
                  >
                    선택하기
                  </button>
                  {service.paid === "recruiting" && (
                    <a
                      className="cs-card__paid-badge"
                      href={`/tools/excel-converter/dispatch?from=${encodeURIComponent(courier)}`}
                    >
                      🧪 자동발송 프로그램 베타 안내 →
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {selected?.marketplace === marketplace && renderTool(selected.marketplace, selected.courier)}
        </div>
      ))}
    </>
  );
}
