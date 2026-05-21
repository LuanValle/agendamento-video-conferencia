import { ArrowLeft, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'

const ADMIN_USER = 'admin'
const ADMIN_PASSWORD = 'Luk35kyw@1k3r'

function AdminLogin() {
  const navigate = useNavigate()
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    // Login temporário: credenciais no frontend servem apenas como barreira visual.
    // Para produção real, use Firebase Authentication e regras adequadas no Firestore.
    if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true')
      navigate('/admin')
      return
    }

    setError('Usuário ou senha inválidos.')
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} />
          Voltar
        </Link>
        <p className="eyebrow">Área restrita</p>
        <h1>Login Administrativo</h1>
        <ErrorMessage message={error} />
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Usuário
            <input value={user} onChange={(event) => setUser(event.target.value)} autoComplete="username" />
          </label>
          <label className="form-field">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button className="button primary" type="submit">
            <LogIn size={18} />
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}

export default AdminLogin
