"use client";

import { usePathname } from "next/navigation";

// basePath(/tools/excel-converter)는 usePathname 값에서 이미 빠져 있다.
const TABS = [
  { href: "/tools/all-tools/", label: "전체도구", match: null },
  { href: "/tools/excel-converter/", label: "엑셀변환기", match: "/" },
  { href: "/tools/excel-converter/guide", label: "이용안내", match: "/guide" },
];

export default function ProgramNav() {
  const pathname = (usePathname() || "/").replace(/(.)\/$/, "$1");

  return (
    <nav className="cs-program-nav" aria-label="Seller Tools 프로그램">
      <ul>
        {TABS.map((tab) => {
          const active = tab.match !== null && tab.match === pathname;
          return (
            <li key={tab.label}>
              <a
                className={`cs-program-link${active ? " cs-program-link--active" : ""}`}
                href={tab.href}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
