"use client";

import { useState } from "react";

const CONTACT_URL = "https://codivostudio.com/#contact";

const OVERVIEW = [
  { no: "01", title: "주문 파일 준비", desc: "네이버 스마트스토어 또는 쿠팡에서 주문내역 다운로드" },
  { no: "02", title: "송장 파일 준비", desc: "로젠택배에서 송장번호가 포함된 엑셀 파일 준비" },
  { no: "03", title: "변환 및 업로드", desc: "엑셀 변환 후 판매자센터에 대량발송 등록" },
];

type Step = { title: string; desc: string; caption: string };

const ORDER_STEPS: Record<string, Step[]> = {
  "네이버 스마트스토어": [
    { title: "판매자센터 로그인", desc: "네이버 스마트스토어 판매자센터에 로그인합니다.", caption: "네이버 스마트스토어 로그인 화면" },
    { title: "주문내역 메뉴 이동", desc: "상단 메뉴에서 '주문/배송'을 클릭합니다.", caption: "주문/배송 메뉴 위치" },
    { title: "주문 조회 및 다운로드", desc: "기간을 설정하고 엑셀 다운로드를 클릭합니다.", caption: "주문 조회 및 다운로드 화면" },
    { title: "파일 저장 및 확인", desc: "다운로드한 파일을 저장하고 내용을 확인합니다. 다운로드 시 비밀번호를 설정했다면 기억해 두세요.", caption: "다운로드된 엑셀 파일 예시" },
  ],
  "쿠팡 윙": [
    { title: "쿠팡 Wing 로그인", desc: "쿠팡 Wing(셀러 센터)에 로그인합니다.", caption: "쿠팡 Wing 로그인 화면" },
    { title: "배송관리 메뉴 이동", desc: "주문/배송 메뉴의 '배송관리'로 이동합니다.", caption: "배송관리 메뉴 위치" },
    { title: "주문 조회 및 다운로드", desc: "기간과 상태를 설정하고 엑셀 다운로드를 클릭합니다.", caption: "주문 조회 및 다운로드 화면" },
    { title: "파일 저장 및 확인", desc: "다운로드한 파일을 저장하고 내용을 확인합니다.", caption: "다운로드된 엑셀 파일 예시" },
  ],
};

type Section = { title: string; sub: string; icon: string; body: React.ReactNode };

function StepCards({ steps }: { steps: Step[] }) {
  return (
    <ol className="cs-guide-steps">
      {steps.map((step, i) => (
        <li className="cs-guide-step" key={step.title}>
          <div className="cs-guide-step__head">
            <span className="cs-guide-step__no">{i + 1}</span>
            <strong>{step.title}</strong>
          </div>
          <p>{step.desc}</p>
          <div className="cs-guide-step__image" role="img" aria-label={step.caption}>
            화면 캡처 이미지
          </div>
          <span className="cs-guide-step__caption">{step.caption}</span>
        </li>
      ))}
    </ol>
  );
}

function OrderDownload() {
  const names = Object.keys(ORDER_STEPS);
  const [tab, setTab] = useState(names[0]);
  return (
    <>
      <div className="cs-guide-tabs" role="tablist">
        {names.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={`cs-guide-tab${tab === name ? " is-active" : ""}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <StepCards steps={ORDER_STEPS[tab]} />
    </>
  );
}

const SECTIONS: Section[] = [
  {
    title: "주문내역 다운로드",
    sub: "네이버 스마트스토어 / 쿠팡",
    icon: "📄",
    body: <OrderDownload />,
  },
  {
    title: "로젠택배 송장 파일 준비",
    sub: "송장번호가 포함된 엑셀 파일",
    icon: "🚚",
    body: (
      <ul className="cs-guide-list">
        <li>로젠택배에서 송장을 발급·등록한 뒤, <b>운송장번호가 들어 있는 엑셀 파일</b>을 다운로드합니다.</li>
        <li>다운로드한 파일은 수정하지 않고 <b>그대로</b> 업로드합니다. (열 순서가 바뀌면 매칭이 되지 않을 수 있습니다.)</li>
        <li>현재는 <b>로젠택배</b>만 변환할 수 있습니다. 다른 택배사는 서비스 예정입니다.</li>
      </ul>
    ),
  },
  {
    title: "변환 및 대량발송 업로드",
    sub: "변환 결과 파일 등록",
    icon: "⬆️",
    body: (
      <ol className="cs-guide-list">
        <li>‘엑셀변환기’ 탭에서 마켓플레이스와 택배사 카드의 <b>선택하기</b>를 누릅니다.</li>
        <li>주문 파일과 송장 파일을 각각 선택하거나, 칸 안으로 끌어다 놓습니다.</li>
        <li>변환을 실행하면 매칭 결과(1차·2차·3차·미매칭 건수)가 표시됩니다.</li>
        <li>결과 파일을 다운로드해 판매자센터의 <b>발송처리 엑셀 일괄 업로드</b>에 등록합니다.</li>
      </ol>
    ),
  },
  {
    title: "매칭 기준 및 오류 해결",
    sub: "미매칭 주문 확인",
    icon: "☰",
    body: (
      <>
        <p className="cs-guide-text">주문과 송장은 아래 순서대로 자동 매칭됩니다.</p>
        <ul className="cs-guide-list">
          <li><b>1차</b> 상품주문번호와 송장 파일의 주문번호가 같으면 바로 연결합니다.</li>
          <li><b>2차</b> 같은 주문번호로 묶인 주문 중 이미 연결된 송장번호를 나머지 주문에도 적용합니다.</li>
          <li><b>3차</b> 1·2차로 못 찾은 주문은 수취인명과 연락처 앞부분이 같은 송장으로 연결합니다.</li>
          <li><b>미매칭</b> 세 단계 모두 실패한 주문입니다. 송장이 아직 등록되지 않았거나 이름·연락처가 다른 경우가 많으니, 송장 파일을 확인한 뒤 다시 변환하거나 직접 입력해 주세요.</li>
        </ul>
        <p className="cs-guide-text">네이버 파일을 열 수 없다는 안내가 나오면 판매자센터에서 설정한 다운로드 비밀번호를 입력해 주세요.</p>
      </>
    ),
  },
  {
    title: "개인정보 및 파일 보안",
    sub: "파일 처리 및 저장 정책",
    icon: "🛡️",
    body: (
      <ul className="cs-guide-list">
        <li>업로드한 파일은 서버 디스크에 <b>저장하지 않고</b>, 변환하는 동안 메모리에서만 처리합니다.</li>
        <li>입력한 네이버 파일 비밀번호는 사용 중인 <b>브라우저에만</b> 기억됩니다. 공용 PC에서는 사용 후 브라우저 기록을 지워 주세요.</li>
      </ul>
    ),
  },
];

export default function GuideContent() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <p className="cs-guide-eyebrow">CODIVO STUDIO · GUIDE</p>
      <h1 className="cs-guide-title">엑셀 변환기 이용안내</h1>
      <p className="cs-guide-lead">주문 파일 준비부터 송장번호 등록까지, 순서대로 따라 해보세요.</p>

      <section className="cs-guide-box">
        <h2 className="cs-guide-box__title">이용 과정 한눈에 보기</h2>
        <div className="cs-guide-flow">
          {OVERVIEW.map((item, i) => (
            <div className="cs-guide-flow__item" key={item.no}>
              <div className="cs-guide-flow__card">
                <span className="cs-guide-flow__no">{item.no}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
              {i < OVERVIEW.length - 1 && <span className="cs-guide-flow__arrow" aria-hidden="true">›</span>}
            </div>
          ))}
        </div>
      </section>

      <h2 className="cs-guide-heading">상세 이용안내</h2>
      <div className="cs-guide-acc">
        {SECTIONS.map((section, i) => {
          const isOpen = open === i;
          return (
            <section className={`cs-guide-acc__item${isOpen ? " is-open" : ""}`} key={section.title}>
              <button
                type="button"
                className="cs-guide-acc__head"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="cs-guide-acc__no">{i + 1}</span>
                <span className="cs-guide-acc__icon" aria-hidden="true">{section.icon}</span>
                <span className="cs-guide-acc__text">
                  <strong>{section.title}</strong>
                  <small>{section.sub}</small>
                </span>
                <span className="cs-guide-acc__chevron" aria-hidden="true">{isOpen ? "⌃" : "⌄"}</span>
              </button>
              {isOpen && <div className="cs-guide-acc__body">{section.body}</div>}
            </section>
          );
        })}
      </div>

      <section className="cs-guide-help">
        <span className="cs-guide-help__icon" aria-hidden="true">?</span>
        <div>
          <strong>아직 해결되지 않았나요?</strong>
          <p>안내 내용을 확인해도 문제가 발생한다면 문의해 주세요.</p>
        </div>
        <a className="cs-guide-help__button" href={CONTACT_URL}>문의하기 ↗</a>
      </section>
    </>
  );
}
