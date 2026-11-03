'use client'

import { useRef, useState } from 'react'

const REPOSITORY = 'https://github.com/sihoon-0077/MCPShield'

const nav = [
  ['보안 검사', '/security-scan'],
  ['검사 기록', '/history'],
  ['운영 콘솔', '/console'],
  ['GitHub', REPOSITORY],
]

const Logo = () => (
  <a className="logo" href="#top" aria-label="MCPShield 홈">
    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 21 9.5 7l4.5 9 4.5-9L25 21" /><path d="M6 17h16" /></svg>
    <span>MCP<span>SHIELD</span></span>
  </a>
)

const ButtonLink = ({ children, secondary = false, href = '#product' }: { children: React.ReactNode; secondary?: boolean; href?: string }) => (
  <a href={href} className={`button ${secondary ? 'button-secondary' : ''}`}>{children}</a>
)

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="header">
    <div className="nav-shell">
      <Logo />
      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="주요 메뉴">
        {nav.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)} {...(href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})}>{label}</a>)}
      </nav>
      <a className="nav-cta" href="/security-scan">보안 검사 시작 <span>↗</span></a>
      <button className="menu" aria-label="메뉴 열기" aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /></button>
    </div>
  </header>
}

function OpticalField() {
  const field = useRef<HTMLDivElement>(null)
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    field.current?.style.setProperty('--mx', `${((event.clientX - box.left) / box.width - .5) * 22}px`)
    field.current?.style.setProperty('--my', `${((event.clientY - box.top) / box.height - .5) * 16}px`)
  }
  return <div className="optical-field" ref={field} onPointerMove={move} aria-hidden="true">
    <div className="aura aura-wide" />
    <div className="aura aura-mint" />
    <div className="aura aura-deep" />
    <div className="aura-core" />
    <div className="hero-vignette" />
  </div>
}

function Hero() {
  return <main id="top" className="hero shell">
    <OpticalField />
    <div className="hero-copy">
      <p className="eyebrow">VERIFY BEFORE EXECUTION</p>
      <h1>AI가 실행하기 전에,<br /><em>위험을 발견하다.</em></h1>
      <p className="hero-lede">AI가 사용하는 외부 도구의 위험을 검증하고,<br />안전한 실행을 위한 기준을 만듭니다.</p>
      <div className="actions"><ButtonLink href="/security-scan">보안 검사 시작하기 <span>↗</span></ButtonLink><a href={REPOSITORY} className="button button-secondary" target="_blank" rel="noreferrer">GitHub에서 코드 보기</a></div>
    </div>
  </main>
}

function Footer() {
  return <footer className="footer shell">
    <div><Logo /><p>Verify first. Execute safely.</p></div>
    <div className="footer-links"><span>PRODUCT</span><a href="/security-scan">보안 검사</a><a href="/history">검사 기록</a><a href="/console">운영 콘솔</a></div>
    <div className="footer-links"><span>CONNECT</span><a href={REPOSITORY} target="_blank" rel="noreferrer">GitHub ↗</a></div>
    <small>© 2026 MCPShield.</small>
  </footer>
}

export function Landing() {
  return <><Header /><Hero /><Footer /></>
}
