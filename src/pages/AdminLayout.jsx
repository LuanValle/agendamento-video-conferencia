import { CalendarDays, Home, Inbox, LayoutDashboard, List, LogOut, XCircle } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    navigate('/')
  }

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
            Pendentes
          </NavLink>
          <NavLink to="/admin/agenda">
            <CalendarDays size={18} />
            Agenda
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
      </main>
    </div>
  )
}

export default AdminLayout
