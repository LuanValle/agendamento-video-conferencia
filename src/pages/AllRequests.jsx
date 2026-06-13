import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import RequestCard from '../components/RequestCard'
import { apiToRequest } from '../utils/apiMappers'
import { REQUESTS_CHANGED_EVENT, subscribeRealtimeEvent } from '../utils/realtimeEvents'
import { useSmartPolling } from '../utils/useSmartPolling'


function AllRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequests = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true)
      setError('')

      // Busca o historico completo diretamente no banco, por meio da API.
      const response = await fetch('/api/solicitacoes')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nao foi possivel carregar as solicitacoes.')
      }

      // Traduz os nomes do banco para os nomes que o componente RequestCard usa.
      setRequests((result.data || []).map(apiToRequest))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests({ showLoading: true })
  }, [fetchRequests])

  useSmartPolling(fetchRequests, 10000)

  useEffect(() => {
    const refreshRequests = () => fetchRequests()
    return subscribeRealtimeEvent(REQUESTS_CHANGED_EVENT, refreshRequests)
  }, [fetchRequests])

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Histórico completo</p>
          <h1>Todas as solicitações</h1>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Carregando solicitacoes...</div>}

      {!loading && requests.length ? (
        <div className="conference-list">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        !loading && <EmptyState hasConferences={false} />
      )}
    </section>
  )
}

export default AllRequests
