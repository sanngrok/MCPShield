'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { controlApi } from '../../lib/control-client'
import type { Admission } from '../release-workflow'
import { LanguageSwitcher } from './i18n'
import { Icon, Sidebar } from './workspace'
import { checkAdmission, startScan, useBoard, useSession, type StartPhase } from './v3-api'
import { chainIdOf, chainLabel, fixtureRelease, flowView, outcomeKo, shownRound, statusKo, when, type FixtureVersion } from './v3-model'
import { LoginRequired, RunsTable, V3FlowMap, VotePills } from './v3-views'

const buttonText: Record<'idle' | StartPhase, string> = { idle: '보안 검사 시작', resolving: '릴리스 확인 중…', registering: '체인 등록 중…', requesting: '검사 요청 중…' }

// The operator registers the exact release and announces a round; validators A, B and C decide it on chain.
export function SecurityScan({ initialVersion }: { initialVersion: FixtureVersion }) {
  const router = useRouter()
  const session = useSession()
  const signedIn = session.status === 'signed-in'
  const { board, error: boardError } = useBoard(signedIn)
  const [version, setVersion] = useState<FixtureVersion>(initialVersion)
  const [phase, setPhase] = useState<'idle' | StartPhase>('idle')
  const [error, setError] = useState('')
  const [admission, setAdmission] = useState<Admission | null>(null)

  const release = fixtureRelease(board?.releases, version)
  const votes = release ? board?.votes[release.releaseId] : undefined
  const round = shownRound(votes)
  const status = votes?.status ?? (release ? release.status : null)
  const revoked = status === 'REVOKED'
  const live = votes?.rounds.find((item) => item.live)
  const scan = board?.scans.find((item) => item.scanId === round?.scanId)
  const flow = flowView({ release, scan, votes, round, actions: board?.actions, admission })
  const chainId = chainIdOf({ release, actions: board?.actions, admission })
  const capabilities = signedIn ? session.session.capabilities : null
  const reader = signedIn && !capabilities?.scan
  const busy = phase !== 'idle'

  useEffect(() => {
    setAdmission(null)
    if (!release || !votes?.policyHash) return
    const controller = new AbortController()
    checkAdmission(release, votes.policyHash, controller.signal).then(setAdmission, () => {})
    return () => controller.abort()
  }, [release, votes?.policyHash])

  const start = async () => {
    if (revoked && release) { router.push(`/scan-results?release=${release.releaseId}`); return }
    if (!capabilities || !board) return
    setError('')
    try {
      const result = await startScan(version, { api: controlApi, capabilities, policies: board.policies, attemptKey: crypto.randomUUID(), onPhase: setPhase })
      router.push(result.kind === 'revoked' ? `/scan-results?release=${result.releaseId}` : `/scan-progress?scan=${result.scanId}${result.reused ? '&reused=1' : ''}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '검사를 시작하지 못했습니다.')
      setPhase('idle')
    }
  }

  const loginNote = <p className="v3-empty">로그인 후 체인 기록을 불러옵니다.</p>
  return <div className="workspace">
    <Sidebar active="Security Scan" />

    <main className="ws-main">
      <header className="ws-topbar"><div className="ws-breadcrumb"><span>MCPShield</span><b>/</b> 보안 검사</div><div><LanguageSwitcher /></div></header>
      <div className="ws-content">
        <div className="ws-heading"><div><p>SECURITY WORKSPACE</p><h1>보안 검사</h1><span>정확한 릴리스를 체인에 등록하고 검증 라운드를 엽니다. 판정은 검증자 A·B·C가 각자 내립니다.</span></div>
          <div className="ws-session" data-raw><i className={signedIn ? '' : 'off'} /> {signedIn ? <>운영 API · <b>{session.session.tenantId} · {session.session.role}</b></> : '로그인 필요'}</div></div>
        {session.status === 'error' && <p className="scan-error v3-banner" role="alert">{session.message}</p>}
        {boardError && <p className="scan-error v3-banner" role="alert">{boardError}</p>}

        <section className="scan-layout">
          <div className="scan-form panel">
            <div className="panel-head"><div><span className="panel-index">01</span><h2>검사 대상</h2><p>검토된 고정 fixture 2개(mail-mcp 1.0.0 · 1.0.1)만 검사할 수 있습니다.</p></div><span className="draft" data-raw>{!signedIn || !board ? '—' : status ?? '미등록'}</span></div>
            <div className="form-grid">
              <label><span>MCP TOOL NAME</span><input value="mail-mcp" readOnly /></label>
              <label><span>VERSION</span><select value={version} onChange={(event) => { setVersion(event.target.value as FixtureVersion); setError('') }} disabled={busy}><option value="1.0.0">1.0.0</option><option value="1.0.1">1.0.1</option></select></label>
              <p className="wide v3-status-line" data-raw>현재 상태: {signedIn ? `${statusKo(status)}${status === 'VERIFIED' && live ? ` · 유효 ~ ${when(live.validUntil)}` : ''}` : '로그인 후 표시'}</p>
              <label className="wide"><span>SOURCE / REPOSITORY</span><input value={`demo/fixtures/mail-mcp-${version} · 운영사와 검증자 3곳이 같은 바이트 사본을 씀`} readOnly /></label>
              <label className="wide"><span>ARTIFACT HASH</span><input className="mono" value={release?.artifactDigest ?? ''} placeholder="등록할 때 고정됩니다 (sha256)" readOnly /></label>
            </div>
            <div className="target-meta" data-raw><span><small>대상 유형</small><b>고정 fixture (합성)</b></span><span><small>검사 정책</small><b>mvp-default-v1 · 2-of-3</b></span><span><small>체인</small><b>{signedIn ? chainLabel(chainId) : '로그인 후 표시'}</b></span></div>
            {error && <p className="scan-error" role="alert" data-raw>{error}</p>}
            {reader && <p className="scan-error" role="status">검사 요청은 운영자 이상 권한이 필요합니다 (현재 {session.status === 'signed-in' ? session.session.role : 'reader'}).</p>}
            {session.status === 'signed-out' ? <div className="form-actions v3-login-slot"><LoginRequired /></div> : <>
              <p className="v3-hint" data-raw>{revoked ? '폐기는 영구입니다. 같은 바이트는 다시 등록·승인할 수 없어 새 검사를 열지 않습니다.' : '같은 버전·정책의 PASS/FAIL 검사가 24시간 안에 있으면 그 결과를 다시 보여 줍니다 (새 라운드 없음).'}</p>
              <div className="form-actions"><button className="ws-button primary scan-start" onClick={() => void start()} disabled={!signedIn || !board || busy || (reader && !revoked)}><Icon name={revoked ? 'result' : 'scan'} /> {revoked ? '폐기 근거 보기' : buttonText[phase]}</button></div>
            </>}
          </div>

          <div className="scan-progress panel">
            <div className="panel-head"><div><span className="panel-index">02</span><h2>검증 흐름</h2></div><span className="complete" data-raw>{!signedIn || !board ? '—' : round ? outcomeKo(round.outcome) : '기록 없음'}</span></div>
            {!signedIn ? loginNote : !board ? <p className="v3-empty">체인 기록을 불러오는 중입니다.</p> : round ? <V3FlowMap flow={flow} compact /> : <p className="v3-empty">이 버전의 투표 라운드가 아직 없습니다.</p>}
          </div>

          <aside className="result-summary panel">
            <div className="panel-head"><div><span className="panel-index">03</span><h2>결과 요약</h2></div></div>
            {!signedIn ? loginNote : <>
              <div className="risk-block" data-raw><small>현재 체인 상태</small><strong className={status === 'VERIFIED' ? 'none' : status === 'REVOKED' || status === 'QUARANTINED' ? '' : 'review'}>{status ?? '—'}</strong><span>{statusKo(status)}</span></div>
              <div className="summary-item" data-raw><small>검증자 합의</small><p>{round ? outcomeKo(round.outcome) : '라운드 기록 없음'}</p><VotePills votes={votes} round={round} /></div>
              <div className={`decision-block ${admission?.decision === 'ALLOW' ? 'allowed' : ''}`} data-raw data-gateway={admission?.decision ?? 'NONE'}><small>실행 판정 (API 조회)</small>
                <div><span><Icon name={admission?.decision === 'ALLOW' ? 'check' : 'alert'} /></span><strong>{admission ? admission.decision : '조회 전'}</strong></div>
                <p>{admission ? `${admission.reasonCode} · 이 화면은 도구를 실행하지 않습니다` : '체인 결론이 있으면 API에 실행 판정을 조회합니다.'}</p></div>
              {release && <a className="result-link" href={`/scan-results?release=${release.releaseId}`}>전체 결과 보기 <span>↗</span></a>}
            </>}
          </aside>
        </section>

        <section className="recent panel">
          <div className="recent-head"><div><h2>최근 검사</h2><p>운영 API에 저장된 이 조직의 최근 검사</p></div><a className="v3-link" href="/history">전체 기록 보기 <span>↗</span></a></div>
          {!signedIn ? <div className="scan-table"><div className="history-empty"><strong>로그인 후 체인 기록을 불러옵니다.</strong></div></div>
            : board?.scans.length ? <RunsTable board={board} limit={4} />
            : <div className="scan-table"><div className="history-empty"><strong>{board ? '아직 검사 기록이 없습니다.' : '검사 기록을 불러오는 중입니다.'}</strong></div></div>}
        </section>
      </div>
    </main>
  </div>
}
