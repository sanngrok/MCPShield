"use client";

import React, { useEffect, useRef, useState } from "react";

// 24px line icons drawn for this mock (no third-party brand marks).
const ICONS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>,
  compose: <><path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" /><path d="M18.4 3.6a2 2 0 0 1 2.8 2.8L12 15.6 8 17l1.4-4z" /></>,
  images: <><rect x="7" y="3" width="14" height="14" rx="3" /><path d="M3 8v10a3 3 0 0 0 3 3h10" /><circle cx="12" cy="8" r="1.4" /><path d="m21 13.5-3.5-3.5L10 17" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  library: <><path d="M4 4h3v16H4zM9 4h3v16H9z" /><path d="m14.4 4.8 2.9-.8 3.7 15.2-2.9.8z" /></>,
  plugin: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="M15.5 12v1.2a2.3 2.3 0 0 0 4.6 0V12" /></>,
  codex: <><path d="M7.5 19a4.5 4.5 0 0 1-.9-8.9A6 6 0 0 1 18 9.5a4.7 4.7 0 0 1-.5 9.5z" /><path d="m9.5 12 2 1.6-2 1.6M13.5 15.2h2" /></>,
  dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  book: <><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3" /><path d="M5 18h14" /></>,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  think: <><path d="M12 5a3 3 0 0 0-5.6 1.5A3 3 0 0 0 4.5 12a3 3 0 0 0 1.9 5A3 3 0 0 0 12 18.5z" /><path d="M12 5a3 3 0 0 1 5.6 1.5 3 3 0 0 1 1.9 5.5 3 3 0 0 1-1.9 5A3 3 0 0 1 12 18.5z" /><path d="M12 5v13.5" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  wave: <path d="M5 10.5v3M8.5 8v8M12 5.5v13M15.5 8v8M19 10.5v3" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="15.5" cy="8.5" r="1.5" /><path d="m3 16 5-5 8 8" /></>,
  pencil: <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  telescope: <><path d="m4 13 13-7 2 4-13 7z" /><path d="M11 13.5 8 21M11 13.5l3 7.5" /></>,
  sketch: <path d="M4 18c3-6 5-12 7-10s-2 9 1 9 4-8 6-6-1 5 2 5" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  branch: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 8v8M18 10a6 6 0 0 1-6 6H8" /></>
};
type IconName = keyof typeof ICONS;

function Icon({ name, className }: { name: IconName; className?: string }) {
  return <svg className={className ? `gpt-icon ${className}` : "gpt-icon"} viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;
}

const NAV: [IconName, string][] = [["compose", "새 채팅"], ["images", "이미지"], ["clock", "예약"], ["library", "라이브러리"], ["plugin", "플러그인"], ["codex", "Codex"], ["dots", "탐색"]];
const PROJECTS: [IconName, string][] = [["book", "숙제"], ["folder", "프롬프트 작성"]];
const RECENT = ["해커톤 발표 리허설", "주간 회의록 요약", "영어 이메일 다듬기", "제주 2박 3일 일정", "React 상태 관리 질문", "논문 초록 번역", "운동 루틴 추천"];
const SUGGESTIONS: [IconName, string][] = [["image", "이미지나 스티커 만들어줘"], ["pencil", "글쓰기"], ["globe", "웹 검색"]];
const TOOLS: [IconName, string, string][] = [
  ["image", "이미지 생성", "무엇이든 시각화하세요"], ["globe", "웹 검색", "실시간 뉴스 및 정보를 찾아보세요"],
  ["folder", "프로젝트에서 Work 시작", "프로젝트에서 채팅을 시작하세요"], ["telescope", "심층 리서치", "상세 보고서 받기"],
  ["sketch", "스케치", "그림을 그려 이미지로 첨부하세요"], ["think", "Thinking", "자세한 답변 제공"]
];
const PLUGINS: [IconName, string, string][] = [["mail", "Gmail", "메일을 읽고 관리합니다"], ["branch", "GitHub", "PR, 이슈, CI를 정리합니다"]];

// Both MCP Shield entries go to the MCPShield site root (127.0.0.1:3000 in the demo); a plain <a> because / is another root layout.
const SHIELD_HREF = "/";
const PENDING_UPDATES = 1;

export function ChatHome({ name, logoSrc }: { name: string; logoSrc: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const composer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => { if (!composer.current?.contains(event.target as Node)) setMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);

  return (
    <div className="gpt">
      <aside className="gpt-side">
        <div className="gpt-side-head">
          <span className="gpt-brand">ChatGPT</span>
          <span className="gpt-side-tools"><button type="button" aria-label="채팅 검색"><Icon name="search" /></button><button type="button" aria-label="사이드바 닫기"><Icon name="sidebar" /></button></span>
        </div>
        <nav className="gpt-nav">
          {NAV.map(([icon, label], index) => <button type="button" className={index === 0 ? "gpt-row active" : "gpt-row"} key={label}><Icon name={icon} />{label}</button>)}
        </nav>
        <div className="gpt-side-scroll">
          <p className="gpt-section">프로젝트</p>
          {PROJECTS.map(([icon, label], index) => <button type="button" className="gpt-row" key={label}><Icon name={icon} className={index === 0 ? "blue" : undefined} />{label}</button>)}
          <p className="gpt-section">최근</p>
          {RECENT.map((title) => <button type="button" className="gpt-row plain" key={title}>{title}</button>)}
        </div>
      </aside>

      <main className="gpt-main">
        <a className="gpt-shield" href={SHIELD_HREF} aria-label={`MCP Shield 열기 · 검사가 필요한 MCP 업데이트 ${PENDING_UPDATES}건`}>
          <img src={logoSrc} alt="" width={28} height={28} />
          <span className="gpt-badge" aria-hidden="true">{PENDING_UPDATES}</span>
          <span className="gpt-tip" aria-hidden="true">MCP Shield · 업데이트 {PENDING_UPDATES}건 검사 필요</span>
        </a>

        <section className="gpt-center">
          <h1 className="gpt-greeting">{name}님, 반갑습니다.</h1>
          <div className="gpt-composer" ref={composer}>
            <div className="gpt-box">
              <button type="button" className="gpt-plus" aria-label="파일 및 도구 추가" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Icon name="plus" /></button>
              <textarea className="gpt-input" rows={1} placeholder="ChatGPT에게 물어보세요" aria-label="메시지" />
              <button type="button" className="gpt-think"><Icon name="think" />Think</button>
              <button type="button" className="gpt-mic" aria-label="받아쓰기"><Icon name="mic" /></button>
              <button type="button" className="gpt-voice" aria-label="음성 모드 시작"><Icon name="wave" /></button>
            </div>
            {menuOpen && (
              <div className="gpt-menu" role="menu">
                {TOOLS.map(([icon, label, hint]) => <button type="button" role="menuitem" className="gpt-item" key={label} onClick={() => setMenuOpen(false)}><Icon name={icon} /><b>{label}</b><span>{hint}</span></button>)}
                <a role="menuitem" className="gpt-item shield" href={SHIELD_HREF}>
                  <img src={logoSrc} alt="" width={20} height={20} /><b>MCP Shield</b><span>MCP 업데이트를 실행 전에 검사합니다</span>
                  <em className="gpt-pill">업데이트 {PENDING_UPDATES}</em>
                </a>
                {PLUGINS.map(([icon, label, hint]) => <button type="button" role="menuitem" className="gpt-item" key={label} onClick={() => setMenuOpen(false)}><Icon name={icon} /><b>{label}</b><span>{hint}</span><i>연결</i></button>)}
                <p className="gpt-menu-hint">플러그인을 검색하려면 입력하세요</p>
              </div>
            )}
          </div>
          <ul className="gpt-suggest">
            {SUGGESTIONS.map(([icon, label]) => <li key={label}><button type="button"><Icon name={icon} />{label}</button></li>)}
          </ul>
        </section>
      </main>
    </div>
  );
}
