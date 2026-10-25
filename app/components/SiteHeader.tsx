"use client";

import { useState } from "react";

// codivostudio-web의 Header.astro와 같은 모양. 이 앱은 vercel.app 주소로도
// 열릴 수 있어서 링크는 절대 주소로 둔다 (어느 도메인에서 열어도 안 깨짐).
const SITE = "https://codivostudio.com";

const NAV_ITEMS = [
  { href: `${SITE}/`, label: "홈" },
  { href: `${SITE}/tools/`, label: "도구", active: true },
  { href: `${SITE}/about/`, label: "소개" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="cs-site-header">
      <div className="cs-site-header__inner">
        <a className="cs-site-header__logo" href={`${SITE}/`}>
          <img
            src="/tools/excel-converter/logo/logo-header.png"
            alt="Codivo Studio"
            width={1222}
            height={200}
          />
        </a>
        <nav className={`cs-site-header__nav${open ? " is-open" : ""}`}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a href={item.href} className={item.active ? "active" : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
            <li className="cs-site-header__mobile-only">
              <a href={`${SITE}/#contact`}>문의하기</a>
            </li>
          </ul>
        </nav>
        <div className="cs-site-header__actions">
          <a className="cs-site-header__outline" href={`${SITE}/#contact`}>
            문의하기
          </a>
          <button
            type="button"
            className="cs-site-header__toggle"
            aria-label="메뉴 열기"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
