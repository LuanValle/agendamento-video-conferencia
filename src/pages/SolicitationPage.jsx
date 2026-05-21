import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import { addRequest } from '../utils/requestStorage'
import { isValidUrl } from '../utils/validationUtils'

const initialForm = {
  name: '',
  nip: '',
  department: '',
  contact: '',
  conferenceName: '',
  platform: '',
  date: '',
  time: '',
  priority: '',
  link: '',
  notes: '',
}

const platforms = ['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'UNA', 'Presencial', 'Outro']
const priorities = ['Baixa', 'Média', 'Alta', 'Crítica']

function SolicitationPage() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateUppercaseField = (field, value) => {
    updateField(field, value.toUpperCase())
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const required = ['name', 'nip', 'department', 'contact', 'conferenceName', 'platform', 'date', 'time', 'priority']
    const missing = required.some((field) => !form[field].trim())

    if (missing) {
      setSuccess('')
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (form.link.trim() && !isValidUrl(form.link.trim())) {
      setSuccess('')
      setError('Informe uma URL válida começando com http:// ou https://.')
      return
    }

    addRequest(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])))
    setForm(initialForm)
    setError('')
    setSuccess('Solicitação enviada com sucesso. Ela ficará pendente para análise administrativa.')
  }

  return (
    <div className="public-shell">
      <main className="solicitation-page">
        <Link className="back-link" to="/">
          <ArrowLeft size={17} />
          Voltar para início
        </Link>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Solicitação pública</p>
              <h1>Solicitar videoconferência</h1>
            </div>
          </div>

          <ErrorMessage message={error} />
          {success && <div className="success-message">{success}</div>}

          <form className="conference-form" onSubmit={handleSubmit} noValidate>
            <label className="form-field">
              GRAD/ESP NOME *
              <input
                value={form.name}
                onChange={(event) => updateUppercaseField('name', event.target.value)}
                placeholder="Ex.: CB-PD VALE"
              />
            </label>
            <label className="form-field">
              NIP *
              <input value={form.nip} onChange={(event) => updateField('nip', event.target.value)} />
            </label>
            <label className="form-field">
              Setor *
              <input value={form.department} onChange={(event) => updateField('department', event.target.value)} />
            </label>
            <label className="form-field">
              Contato *
              <input value={form.contact} onChange={(event) => updateField('contact', event.target.value)} />
            </label>
            <label className="form-field">
              Nome da videoconferência *
              <input
                value={form.conferenceName}
                onChange={(event) => updateField('conferenceName', event.target.value)}
              />
            </label>
            <label className="form-field">
              Local ou plataforma *
              <select value={form.platform} onChange={(event) => updateField('platform', event.target.value)}>
                <option value="">Selecione</option>
                {platforms.map((platform) => (
                  <option value={platform} key={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Data *
              <input type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} />
            </label>
            <label className="form-field">
              Horário *
              <input type="time" value={form.time} onChange={(event) => updateField('time', event.target.value)} />
            </label>
            <label className="form-field">
              Prioridade *
              <select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                <option value="">Selecione</option>
                {priorities.map((priority) => (
                  <option value={priority} key={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Link da videoconferência
              <input
                value={form.link}
                onChange={(event) => updateField('link', event.target.value)}
                placeholder="https://..."
              />
            </label>
            <label className="form-field full-width">
              Observações
              <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows="4" />
            </label>
            <div className="form-actions full-width">
              <button className="button primary" type="submit">
                <Send size={18} />
                Enviar solicitação
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default SolicitationPage
