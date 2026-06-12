import { useEffect, useState } from 'react'
import EmptyState from '../components/EmptyState'
import RequestCard from '../components/RequestCard'
import { apiToRequest } from '../utils/apiMappers'

function RejectedRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError('')

      // Carrega todas as solicitacoes do banco e filtra as rejeitadas na tela.
      const response = await fetch('/api/solicitacoes')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível carregar as solicitações rejeitadas.')
      }

      // Converte os nomes do banco para o formato esperado pelo RequestCard.
      setRequests((result.data || []).map(apiToRequest))
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const rejected = requests.filter((request) => request.status === 'rejeitada')

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Histórico</p>
          <h1>Solicitações rejeitadas</h1>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Carregando solicitações rejeitadas...</div>}

      {!loading && rejected.length ? (
        <div className="conference-list">
          {rejected.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        !loading && <EmptyState hasConferences={false} />
      )}
    </section>
  )
}

export default RejectedRequests
