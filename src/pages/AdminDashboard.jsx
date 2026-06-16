import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import Dashboard from '../components/Dashboard'
import { apiToRequest } from '../utils/apiMappers'
import { getRequestSummary } from '../utils/requestUtils'
import { REQUESTS_CHANGED_EVENT, subscribeRealtimeEvent } from '../utils/realtimeEvents'
import { useSmartPolling } from '../utils/useSmartPolling'

function AdminDashboard() {
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    expired: 0,
    today: 0,
    highPriority: 0,
  })
  const [error, setError] = useState('')
  const [status, setStatus] = useState({
    database: 'verificando',
    lastUpdatedAt: null,
    pending: 0,
    today: 0,
  })

  const fetchSummary = useCallback(async () => {
    try {
      setError('')

      // Busca as solicitacoes no banco para montar os numeros do painel.
      const response = await fetch('/api/solicitacoes')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nao foi possivel carregar o painel.')
      }

      const requests = (result.data || []).map(apiToRequest)
      const nextSummary = getRequestSummary(requests)

      setSummary(nextSummary)
      setStatus({
        database: 'conectado',
        lastUpdatedAt: new Date(),
        pending: nextSummary.pending,
        today: nextSummary.today,
      })
    } catch (error) {
      setError(error.message)
      setStatus((current) => ({
        ...current,
        database: 'erro',
      }))
    }
  }, [])

  useSmartPolling(fetchSummary, 10000)

  useEffect(() => {
    const refreshSummary = () => fetchSummary()
    return subscribeRealtimeEvent(REQUESTS_CHANGED_EVENT, refreshSummary)
  }, [fetchSummary])

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Painel administrativo</h1>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Dashboard summary={summary} />
      <section className="status-panel" aria-label="Status do sistema">
        <article>
          <span>Banco</span>
          <strong className={status.database === 'conectado' ? 'status-ok' : 'status-error'}>
            {status.database}
          </strong>
        </article>
        <article>
          <span>Última atualização</span>
          <strong>
            {status.lastUpdatedAt
              ? status.lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </strong>
        </article>
        <article>
          <span>Pendentes</span>
          <strong>{status.pending}</strong>
        </article>
        <article>
          <span>Solicitações de hoje</span>
          <strong>{status.today}</strong>
        </article>
      </section>
      <div className="admin-shortcuts">
        <Link className="entry-card" to="/admin/solicitacoes">
          <strong>Solicitações pendentes</strong>
          <span>Analisar pedidos enviados pelo formulário público.</span>
        </Link>
        <Link className="entry-card" to="/admin/agenda">
          <strong>Agenda aprovada</strong>
          <span>Ver videoconferências aprovadas e cadastradas.</span>
        </Link>
        <Link className="entry-card" to="/admin/auditoria">
          <strong>Auditoria</strong>
          <span>Gerar relatorios e consultar acoes administrativas.</span>
        </Link>
        <Link className="entry-card" to="/admin/todas">
          <strong>Todas as solicitações</strong>
          <span>Consultar o histórico completo.</span>
        </Link>
      </div>
    </section>
  )
}

export default AdminDashboard
