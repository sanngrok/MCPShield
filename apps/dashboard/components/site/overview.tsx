'use client'

import { useEffect, useState } from 'react'
import type { Admission } from '../release-workflow'
import { LanguageSwitcher } from './i18n'
import { Sidebar } from './workspace'
import { checkAdmission, useBoard, useSession } from './v3-api'
import { chainIdOf, chainLabel, flowView, shownRound, statusKo } from './v3-model'
import { LoginRequired, V3FlowMap } from './v3-views'

// Current chain state per release, read now from the V3 operator API and the chain. No sample or replayed data.
export function Overview() {
  const session = useSession()
  const signedIn = session.status === 'signed-in'
  const { board, error } = useBoard(signedIn)
  const [admissions, setAdmissions] = useState<Record<string, Admission>>({})
  const releases = (board?.releases ?? []).filter((item) => board?.votes[item.releaseId]).sort((a, b) => a.version.localeCompare(b.version))

  useEffect(() => {
    if (!board) return
    const controller = new AbortController()
    setAdmissions({})
    for (const release of board.releases) {
      const policyHash = board.votes[release.releaseId]?.policyHash
      if (policyHash) checkAdmission(release, policyHash, controller.signal).then((admission) => setAdmissions((previous) => ({ ...previous, [release.releaseId]: admission })), () => {})
    }
    return () => controller.abort()
  }, [board])

  return <div className="workspace results-workspace">
    <Sidebar active="Overview" />
    <main className="ws-main">
      <header className="ws-topbar"><div className="ws-breadcrumb"><span>MCPShield</span><b>/</b> 개요</div><div><LanguageSwitcher /></div></header>
      <div className="ws-content results-content">
        <div className="ws-heading"><div><p>RELEASE REGISTRY</p><h1>개요</h1><span>체인에 기록된 릴리스별 현재 상태입니다. 모든 값은 지금 운영 API와 체인에서 읽은 것입니다.</span></div></div>
        {(session.status === 'error' || error) && <p className="scan-error v3-banner" role="alert">{session.status === 'error' ? session.message : error}</p>}
        {session.status === 'signed-out' ? <section className="recent panel"><div className="scan-table"><div className="history-empty"><LoginRequired /></div></div></section>
          : !board ? <section className="recent panel"><div className="scan-table"><div className="history-empty"><strong>체인 기록을 불러오는 중입니다.</strong></div></div></section>
          : !releases.length ? <section className="recent panel"><div className="scan-table"><div className="history-empty"><strong>아직 등록된 릴리스가 없습니다.</strong><a className="ws-button primary" href="/security-scan">보안 검사 시작</a></div></div></section>
          : <section className="v3-release-grid">{releases.map((release) => {
            const votes = board.votes[release.releaseId], round = shownRound(votes), admission = admissions[release.releaseId] ?? null
            const status = votes?.status ?? release.status
            const flow = flowView({ release, votes, round, actions: board.actions, admission, scan: board.scans.find((item) => item.scanId === round?.scanId) })
            return <article className="panel v3-release-card" key={release.releaseId} data-release-status={status} data-raw>
              <div className="report-panel-head"><div><small>{release.legacyReleaseId}</small><h2>{status} · {statusKo(status)}</h2></div><a className="v3-link" href={`/scan-results?release=${release.releaseId}`}>결과 보기 <span>↗</span></a></div>
              <V3FlowMap flow={flow} compact />
              <p className="v3-card-foot">{admission ? `Gateway ${admission.decision} · ${admission.reasonCode}` : 'Gateway 판정 조회 중'} · {chainLabel(chainIdOf({ release, actions: board.actions, admission }))}</p>
            </article>
          })}</section>}
      </div>
    </main>
  </div>
}
