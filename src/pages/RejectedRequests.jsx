import EmptyState from '../components/EmptyState'
import RequestCard from '../components/RequestCard'
import { loadRequests } from '../utils/requestStorage'

function RejectedRequests() {
  const rejected = loadRequests().filter((request) => request.status === 'rejeitada')

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Histórico</p>
          <h1>Solicitações rejeitadas</h1>
        </div>
      </div>
      {rejected.length ? (
        <div className="conference-list">
          {rejected.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState hasConferences={false} />
      )}
    </section>
  )
}

export default RejectedRequests
