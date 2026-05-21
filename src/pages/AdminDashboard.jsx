import { Link } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import { getRequestSummary } from '../utils/requestUtils'

function AdminDashboard() {
  const summary = getRequestSummary()

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h1>Painel administrativo</h1>
        </div>
      </div>
      <Dashboard summary={summary} />
      <div className="admin-shortcuts">
        <Link className="entry-card" to="/admin/solicitacoes">
          <strong>Solicitações pendentes</strong>
          <span>Analisar pedidos enviados pelo formulário público.</span>
        </Link>
        <Link className="entry-card" to="/admin/agenda">
          <strong>Agenda aprovada</strong>
          <span>Ver videoconferências aprovadas e cadastradas.</span>
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
