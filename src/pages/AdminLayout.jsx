import { CalendarDays, FileText, Home, Inbox, LayoutDashboard, List, LogOut, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import RejectModal from '../components/RejectModal'
import { apiToRequest } from '../utils/apiMappers'
import { formatDatePtBr } from '../utils/dateUtils'
import { notifyAgendaChanged, notifyRequestsChanged, REQUESTS_CHANGED_EVENT, subscribeRealtimeEvent } from '../utils/realtimeEvents'
import { useSmartPolling } from '../utils/useSmartPolling'

const priorityClassByName = {
  Baixa: 'low',
  Média: 'medium',
  Media: 'medium',
  Alta: 'high',
  Crítica: 'critical',
  Critica: 'critical',
}

function AdminLayout() {
  const navigate = useNavigate()
  const [pendingRequests, setPendingRequests] = useState([])
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [confirmingRequest, setConfirmingRequest] = useState(null)
  const [rejectingRequest, setRejectingRequest] = useState(null)

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/solicitacoes?status=pendente')
      const result = await response.json()

      if (!response.ok) return

      // Mantém somente as solicitações pendentes para alimentar o badge e o card do modo telão.
      setPendingRequests((result.data || []).map(apiToRequest))
    } catch {
      // Se a checagem falhar, o sistema tenta novamente no próximo ciclo.
    }
  }, [])

  useSmartPolling(fetchPendingRequests, 10000)

  useEffect(() => {
    const refreshPendingRequests = () => fetchPendingRequests()
    return subscribeRealtimeEvent(REQUESTS_CHANGED_EVENT, refreshPendingRequests)
  }, [fetchPendingRequests])

  const handleLogout = async () => {
    // Limpa a sessão visual e também pede para a API remover o cookie administrativo.
    sessionStorage.removeItem('adminAuthenticated')
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => {})
    navigate('/')
  }

  const approveFromNotification = async () => {
    if (!confirmingRequest || actionLoadingId) return

    try {
      setActionLoadingId(confirmingRequest.id)

      await fetch(`/api/solicitacoes/${confirmingRequest.id}/aprovar`, {
        method: 'PATCH',
      })

      setConfirmingRequest(null)
      await fetchPendingRequests()
      notifyRequestsChanged()
      notifyAgendaChanged()
    } finally {
      setActionLoadingId(null)
    }
  }

  const rejectFromNotification = async (reason) => {
    if (!rejectingRequest || actionLoadingId) return

    try {
      setActionLoadingId(rejectingRequest.id)

      await fetch(`/api/solicitacoes/${rejectingRequest.id}/rejeitar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivo_rejeicao: reason.trim(),
        }),
      })

      setRejectingRequest(null)
      await fetchPendingRequests()
      notifyRequestsChanged()
    } finally {
      setActionLoadingId(null)
    }
  }

  const firstPendingRequest = pendingRequests[0]
  const notificationPriorityClass =
    priorityClassByName[firstPendingRequest?.priority] || 'medium'

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Videoconferências</h1>
        </div>
        <nav className="admin-nav" aria-label="Navegação administrativa">
          <NavLink to="/admin" end>
            <LayoutDashboard size={18} />
            Painel
          </NavLink>
          <NavLink to="/admin/solicitacoes">
            <Inbox size={18} />
            <span>Pendentes</span>
            {pendingRequests.length > 0 && (
              <span className="pending-badge" aria-label={`${pendingRequests.length} solicitações pendentes`}>
                {pendingRequests.length}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/agenda">
            <CalendarDays size={18} />
            Agenda
          </NavLink>
          <NavLink to="/admin/auditoria">
            <FileText size={18} />
            Auditoria
          </NavLink>
          <NavLink to="/admin/rejeitadas">
            <XCircle size={18} />
            Rejeitadas
          </NavLink>
          <NavLink to="/admin/todas">
            <List size={18} />
            Todas
          </NavLink>
          <NavLink to="/">
            <Home size={18} />
            Início
          </NavLink>
        </nav>
        <button className="button secondary" type="button" onClick={handleLogout}>
          <LogOut size={17} />
          Sair
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />

        {firstPendingRequest && (
          <aside className={`fullscreen-request-card priority-${notificationPriorityClass}`} aria-live="polite">
            <div className="fullscreen-request-header">
              <span className="fullscreen-request-count">{pendingRequests.length}</span>
              <div>
                <strong>{firstPendingRequest.conferenceName}</strong>
                <p>{firstPendingRequest.priority} • {firstPendingRequest.platform}</p>
              </div>
            </div>

            <dl className="fullscreen-request-details">
              <div>
                <dt>Data</dt>
                <dd>{formatDatePtBr(firstPendingRequest.date)}</dd>
              </div>
              <div>
                <dt>Horário</dt>
                <dd>{firstPendingRequest.time}</dd>
              </div>
              <div>
                <dt>Solicitante</dt>
                <dd>{firstPendingRequest.name}</dd>
              </div>
              <div>
                <dt>Contato</dt>
                <dd>{firstPendingRequest.contact}</dd>
              </div>
              {firstPendingRequest.responsibleEmail && (
                <div>
                  <dt>Email</dt>
                  <dd>{firstPendingRequest.responsibleEmail}</dd>
                </div>
              )}
              <div>
                <dt>Link</dt>
                <dd>{firstPendingRequest.link ? 'Informado' : firstPendingRequest.requestLink ? 'Solicitou criação' : 'Não informado'}</dd>
              </div>
              <div>
                <dt>Setor</dt>
                <dd>{firstPendingRequest.department}</dd>
              </div>
              <div>
                <dt>NIP</dt>
                <dd>{firstPendingRequest.nip}</dd>
              </div>
            </dl>

            {firstPendingRequest.notes && (
              <p className="fullscreen-request-notes">{firstPendingRequest.notes}</p>
            )}

            <div className="fullscreen-request-actions">
              <button
                className="icon-button success"
                type="button"
                onClick={() => setConfirmingRequest(firstPendingRequest)}
                disabled={actionLoadingId === firstPendingRequest.id}
              >
                Aprovar
              </button>
              <button
                className="icon-button danger"
                type="button"
                onClick={() => setRejectingRequest(firstPendingRequest)}
                disabled={actionLoadingId === firstPendingRequest.id}
              >
                Recusar
              </button>
            </div>
          </aside>
        )}

        {confirmingRequest && (
          <ConfirmModal
            title="Aprovar solicitação"
            message={`Deseja aprovar "${confirmingRequest.conferenceName}"?`}
            confirmLabel="Aprovar"
            isLoading={actionLoadingId === confirmingRequest.id}
            onConfirm={approveFromNotification}
            onCancel={() => setConfirmingRequest(null)}
          />
        )}

        {rejectingRequest && (
          <RejectModal
            onConfirm={rejectFromNotification}
            onCancel={() => setRejectingRequest(null)}
            isLoading={actionLoadingId === rejectingRequest.id}
          />
        )}
      </main>
    </div>
  )
}

export default AdminLayout
