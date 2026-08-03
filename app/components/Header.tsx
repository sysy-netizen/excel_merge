const NAV_LINKS = [
  { href: "https://codivostudio.com/tools/", label: "전체도구" },
  { href: "https://codivostudio.com/tools/rank-tracker/", label: "랭킹추적기" },
  { href: "https://codivostudio.com/tools/keyword-analysis/", label: "키워드분석" },
  { href: "#", label: "엑셀변환기", active: true },
  { href: "https://codivostudio.com/tools/price-calculator/", label: "가격계산기" },
];

export default function Header() {
  return (
    <div className="cs-header">
      <div className="cs-header__top">
        <a
          className="cs-header__brand"
          href="https://codivostudio.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Codivo Studio
        </a>
        <a
          className="cs-header__badge"
          href="https://codivostudio.com/tools/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Seller Tools
        </a>
      </div>
      <div className="cs-header__nav">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            className={`cs-header__link${link.active ? " is-active" : ""}`}
            href={link.href}
            target={link.active ? undefined : "_blank"}
            rel={link.active ? undefined : "noopener noreferrer"}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
