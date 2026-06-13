import { CalendarPlus, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import sisvcLogo from '../assets/sisvc.png'

function HomePage() {
  return (
    <main className="entry-page">
      <section className="entry-hero">
        <div className="entry-brand">
          <div className="entry-brand-copy">
            <p className="eyebrow">Sistema corporativo</p>
            <h1>Agendador de Videoconferências</h1>
            <p>Solicite videoconferências ou acesse o painel administrativo.</p>
          </div>
          <div className="entry-logo-frame" aria-hidden="true">
            <img src={sisvcLogo} alt="" />
          </div>
        </div>

        <div className="entry-actions">
          <Link className="entry-card" to="/solicitar">
            <CalendarPlus size={34} />
            <strong>Solicitar videoconferência</strong>
            <span>Envie uma solicitação para análise.</span>
          </Link>
          <Link className="entry-card" to="/admin/login">
            <LogIn size={34} />
            <strong>Login</strong>
            <span>Acesse o painel administrativo.</span>
          </Link>
        </div>
      </section>
    </main>
  )
}

export default HomePage
