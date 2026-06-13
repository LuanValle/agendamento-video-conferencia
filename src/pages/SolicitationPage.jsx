import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import { formatContact, formatNip, normalizeSector, onlyDigits } from '../utils/formatters'
import { notifyRequestsChanged } from '../utils/realtimeEvents'
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

const requiredFields = [
  'name',
  'nip',
  'department',
  'contact',
  'conferenceName',
  'platform',
  'date',
  'time',
  'priority',
]

const platforms = ['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'UNA', 'Presencial', 'Outro']
const priorities = ['Baixa', 'Média', 'Alta', 'Crítica']

const isPastDate = (value) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${value}T00:00:00`) < today
}

const mapFormToApiPayload = (form) => ({
  nome: form.name.trim(),
  nip: form.nip.trim(),
  setor: normalizeSector(form.department).trim(),
  contato: form.contact.trim(),
  nome_videoconferencia: form.conferenceName.trim(),
  local_plataforma: form.platform.trim(),
  data: form.date.trim(),
  horario: form.time.trim(),
  prioridade: form.priority.trim(),
  link: form.link.trim(),
  observacoes: form.notes.trim(),
})

function SolicitationPage() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSending, setIsSending] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateUppercaseField = (field, value) => {
    updateField(field, value.toUpperCase())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSending) return

    const hasMissingRequiredField = requiredFields.some((field) => !form[field].trim())

    if (hasMissingRequiredField) {
      setSuccess('')
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (onlyDigits(form.nip).length !== 8) {
      setSuccess('')
      setError('Informe o NIP no formato 19.0485.56.')
      return
    }

    if (![10, 11].includes(onlyDigits(form.contact).length)) {
      setSuccess('')
      setError('Informe o contato com DDD.')
      return
    }

    if (isPastDate(form.date)) {
      setSuccess('')
      setError('A data não pode ser anterior à data atual.')
      return
    }

    if (form.link.trim() && !isValidUrl(form.link.trim())) {
      setSuccess('')
      setError('Informe uma URL válida começando com http:// ou https://.')
      return
    }

    try {
      setIsSending(true)

      // Envia a solicitação pública para a API salvar no banco.
      const response = await fetch('/api/solicitacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapFormToApiPayload(form)),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setSuccess('')
        setError(result.error || 'Não foi possível enviar a solicitação.')
        return
      }

      setForm(initialForm)
      setError('')
      notifyRequestsChanged()
      setSuccess('Solicitação enviada com sucesso. Ela ficará pendente para análise administrativa.')
    } catch {
      setSuccess('')
      setError('Não foi possível conectar com a API.')
    } finally {
      setIsSending(false)
    }
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
              <input
                value={form.nip}
                onChange={(event) => updateField('nip', formatNip(event.target.value))}
                placeholder="19.0485.56"
              />
            </label>
            <label className="form-field">
              Setor *
              <input
                value={form.department}
                onChange={(event) => updateField('department', normalizeSector(event.target.value))}
                placeholder="STI"
              />
            </label>
            <label className="form-field">
              Contato *
              <input
                value={form.contact}
                onChange={(event) => updateField('contact', formatContact(event.target.value))}
                placeholder="(92) 99999-9999"
              />
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
              <button className="button primary" type="submit" disabled={isSending}>
                <Send size={18} />
                {isSending ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default SolicitationPage
