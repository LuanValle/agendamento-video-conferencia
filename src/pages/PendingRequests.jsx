import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import RejectModal from '../components/RejectModal'
import RequestCard from '../components/RequestCard'
import { loadConferences, saveConferences } from '../utils/storage'
import { loadRequests, updateRequestStatus } from '../utils/requestStorage'
import { requestToConference } from '../utils/requestUtils'

function PendingRequests() {
  const [requests, setRequests] = useState(() => loadRequests())
  const [rejecting, setRejecting] = useState(null)

  const pending = requests.filter((request) => request.status === 'pendente')

  const approveRequest = (request) => {
    const conferences = loadConferences()
    saveConferences([
      ...conferences,
      {
        ...requestToConference(request),
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
        requestId: request.id,
      },
    ])
    setRequests(updateRequestStatus(request.id, 'aprovada'))
  }

  const rejectRequest = (reason) => {
    setRequests(updateRequestStatus(rejecting.id, 'rejeitada', { rejectionReason: reason }))
    setRejecting(null)
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Análise</p>
          <h1>Solicitações pendentes</h1>
        </div>
      </div>
      {pending.length ? (
        <div className="conference-list">
          {pending.map((request) => (
            <RequestCard key={request.id} request={request} onApprove={approveRequest} onReject={setRejecting} />
          ))}
        </div>
      ) : (
        <EmptyState hasConferences={false} />
      )}
      {rejecting && <RejectModal onConfirm={rejectRequest} onCancel={() => setRejecting(null)} />}
    </section>
  )
}

export default PendingRequests
