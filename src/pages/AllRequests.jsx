import EmptyState from '../components/EmptyState'
import RequestCard from '../components/RequestCard'
import { loadRequests } from '../utils/requestStorage'

function AllRequests() {
  const requests = loadRequests()

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Histórico completo</p>
          <h1>Todas as solicitações</h1>
        </div>
      </div>
      {requests.length ? (
        <div className="conference-list">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState hasConferences={false} />
      )}
    </section>
  )
}

export default AllRequests
