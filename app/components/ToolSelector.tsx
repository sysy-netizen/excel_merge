"use client";

import { useState } from "react";
import ComingSoon from "./ComingSoon";
import NaverLogenPanel from "./converters/NaverLogenPanel";
import CoupangLogenPanel from "./converters/CoupangLogenPanel";

const MARKETPLACES = ["네이버 스마트스토어", "쿠팡 윙"] as const;
const COURIERS = ["로젠택배", "CJ대한통운", "우체국택배", "롯데택배"] as const;

type Marketplace = (typeof MARKETPLACES)[number];
type Courier = (typeof COURIERS)[number];

// (마켓플레이스, 택배사) -> 실제로 이용 가능한지 여부.
// 새 택배사가 준비되면 여기 값만 true로 바꾸면 카드에 자동으로 반영됩니다.
const SERVICES: Record<string, boolean> = {
  "네이버 스마트스토어|로젠택배": true,
  "쿠팡 윙|로젠택배": true,
};

const LOGOS: Record<Marketplace, string> = {
  "네이버 스마트스토어": "/logo/naver_logo.png",
  "쿠팡 윙": "/logo/coupang_logo.png",
};

const COURIER_LOGOS: Record<Courier, string> = {
  "로젠택배": "/logo/로젠택배-BI.png",
  "CJ대한통운": "/logo/cj_logo.png",
  "우체국택배": "/logo/우체국_logo.png",
  "롯데택배": "/logo/롯데_logo.png",
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
              const available = SERVICES[serviceKey(marketplace, courier)] ?? false;
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
