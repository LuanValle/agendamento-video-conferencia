import { Download, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { exportAuditAgendaCsv, exportAuditLogsCsv } from '../utils/auditExportUtils'

const todayIso = () => new Date().toISOString().slice(0, 10)

const firstDayOfMonthIso = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

const actionLabels = {
  aprovar_solicitacao: 'Aprovou solicitação',
  rejeitar_solicitacao: 'Rejeitou solicitação',
  criar_videoconferencia: 'Criou videoconferência',
  editar_videoconferencia: 'Editou videoconferência',
  concluir_videoconferencia: 'Marcou como concluída',
  reabrir_videoconferencia: 'Reabriu videoconferência',
  excluir_videoconferencia: 'Excluiu videoconferência',
}

const formatDateTime = (value) => {
  if (!value) return '--'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

const getLogTitle = (log) => {
  const details = log.detalhes || {}
  return details.nome_videoconferencia || details.nome || details.depois?.nome || details.antes?.nome || 'Registro administrativo'
}

const getLogDescription = (log) => {
  const details = log.detalhes || {}
  const parts = [
    details.solicitante ? `Solicitante: ${details.solicitante}` : '',
    details.setor ? `Setor: ${details.setor}` : '',
    details.quantidade ? `Quantidade: ${details.quantidade}` : '',
    details.motivo_rejeicao ? `Motivo: ${details.motivo_rejeicao}` : '',
  ].filter(Boolean)

  return parts.join(' • ')
}

function AuditPage() {
  const [filters, setFilters] = useState({
    inicio: firstDayOfMonthIso(),
    fim: todayIso(),
  })
  const [agenda, setAgenda] = useState([])
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    concluidas: 0,
    pendentes: 0,
    comLink: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.inicio) params.set('inicio', filters.inicio)
    if (filters.fim) params.set('fim', filters.fim)
    return params.toString()
  }, [filters])

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/auditoria?${queryString}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nao foi possivel carregar a auditoria.')
      }

      setAgenda(result.agenda || [])
      setLogs(result.logs || [])
      setSummary(result.summary || {
        total: 0,
        concluidas: 0,
        pendentes: 0,
        comLink: 0,
      })
      setLastUpdatedAt(new Date())
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }, [queryString])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Auditoria</p>
          <h1>Relatórios administrativos</h1>
          {lastUpdatedAt && (
            <span className="last-updated">
              Atualizado às {lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <button className="button secondary" type="button" onClick={fetchAudit} disabled={loading}>
          <RefreshCw size={17} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="panel audit-panel" aria-label="Filtros de auditoria">
        <div className="audit-filters">
          <label className="form-field">
            Data inicial
            <input
              type="date"
              value={filters.inicio}
              onChange={(event) => updateFilter('inicio', event.target.value)}
            />
          </label>
          <label className="form-field">
            Data final
            <input
              type="date"
              value={filters.fim}
              onChange={(event) => updateFilter('fim', event.target.value)}
            />
          </label>
          <div className="audit-actions">
            <button
              className="button primary"
              type="button"
              onClick={() => exportAuditAgendaCsv(agenda, filters)}
              disabled={!agenda.length}
            >
              <Download size={17} />
              Exportar agenda CSV
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => exportAuditLogsCsv(logs, filters)}
              disabled={!logs.length}
            >
              <Download size={17} />
              Exportar ações CSV
            </button>
          </div>
        </div>
      </section>

      <section className="audit-summary" aria-label="Resumo da auditoria">
        <article>
          <span>VCs no período</span>
          <strong>{summary.total}</strong>
        </article>
        <article>
          <span>Concluídas</span>
          <strong>{summary.concluidas}</strong>
        </article>
        <article>
          <span>Pendentes</span>
          <strong>{summary.pendentes}</strong>
        </article>
        <article>
          <span>Com link</span>
          <strong>{summary.comLink}</strong>
        </article>
      </section>

      <section className="panel audit-panel" aria-label="Ações administrativas">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2>Ações registradas</h2>
          </div>
          <span className="audit-count">{logs.length} registros</span>
        </div>

        {loading && <div className="state-box">Carregando auditoria...</div>}

        {!loading && !logs.length && (
          <div className="state-box">Nenhuma ação administrativa registrada nesse período.</div>
        )}

        {!loading && logs.length > 0 && (
          <div className="audit-log-list">
            {logs.map((log) => (
              <article className="audit-log-item" key={log.id}>
                <div>
                  <strong>{actionLabels[log.acao] || log.acao}</strong>
                  <span>{formatDateTime(log.criado_em)} • {log.usuario || 'admin'}</span>
                </div>
                <p>{getLogTitle(log)}</p>
                {getLogDescription(log) && <small>{getLogDescription(log)}</small>}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default AuditPage
