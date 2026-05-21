import { useEffect, useMemo, useState } from 'react'
import { Monitor, MonitorOff } from 'lucide-react'
import ExportActions from '../components/ExportActions'
import ConferenceForm, { emptyForm } from '../components/ConferenceForm'
import ConferenceList from '../components/ConferenceList'
import Dashboard from '../components/Dashboard'
import Filters from '../components/Filters'
import SearchBar from '../components/SearchBar'
import {
  getSituation,
  isToday,
  isWithinCurrentMonth,
  isWithinCurrentWeek,
  isWithinNext30Days,
  sortByDateAndTime,
} from '../utils/dateUtils'
import { exportCsv, exportJsonBackup, importJsonBackup } from '../utils/exportUtils'
import { loadConferences, saveConferences } from '../utils/storage'
import { validateConference } from '../utils/validationUtils'

function filterConferences(conferences, activeFilter) {
  const predicates = {
    all: () => true,
    pending: (conference) => getSituation(conference) === 'pendente',
    completed: (conference) => conference.completed,
    expired: (conference) => getSituation(conference) === 'vencida',
    'high-critical': (conference) => ['Alta', 'Crítica'].includes(conference.priority),
    today: (conference) => isToday(conference.date),
    week: (conference) => isWithinCurrentWeek(conference.date),
    month: (conference) => isWithinCurrentMonth(conference.date),
    'next-30': (conference) => isWithinNext30Days(conference.date),
  }

  return conferences.filter(predicates[activeFilter] || predicates.all)
}

function searchConferences(conferences, searchTerm) {
  const normalized = searchTerm.trim().toLowerCase()
  if (!normalized) return conferences

  return conferences.filter((conference) =>
    [conference.name, conference.platform, conference.responsible, conference.department, conference.notes]
      .join(' ')
      .toLowerCase()
      .includes(normalized),
  )
}

function ApprovedAgenda() {
  const [conferences, setConferences] = useState(() => loadConferences())
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [presentationMode, setPresentationMode] = useState(false)

  useEffect(() => {
    saveConferences(conferences)
  }, [conferences])

  useEffect(() => {
    document.body.classList.toggle('body-presentation-mode', presentationMode)

    if (presentationMode) {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
    }

    return () => {
      document.body.classList.remove('body-presentation-mode')
    }
  }, [presentationMode])

  const togglePresentationMode = () => {
    setPresentationMode((current) => !current)
  }

  const sortedConferences = useMemo(() => sortByDateAndTime(conferences), [conferences])

  const visibleConferences = useMemo(() => {
    const filtered = filterConferences(sortedConferences, activeFilter)
    return searchConferences(filtered, searchTerm)
  }, [activeFilter, searchTerm, sortedConferences])

  const displayedConferences = presentationMode ? sortedConferences : visibleConferences

  const summary = useMemo(
    () => ({
      total: conferences.length,
      pending: conferences.filter((conference) => getSituation(conference) === 'pendente').length,
      completed: conferences.filter((conference) => conference.completed).length,
      expired: conferences.filter((conference) => getSituation(conference) === 'vencida').length,
      today: conferences.filter((conference) => isToday(conference.date)).length,
      highPriority: conferences.filter((conference) => ['Alta', 'Crítica'].includes(conference.priority)).length,
    }),
    [conferences],
  )

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setErrors({})
  }

  const addConference = (conference) => {
    setConferences((current) => [
      ...current,
      {
        ...conference,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const editConference = (id, updates) => {
    setConferences((current) =>
      current.map((conference) => (conference.id === id ? { ...conference, ...updates } : conference)),
    )
  }

  const deleteConference = (id) => {
    const confirmed = window.confirm('Deseja excluir esta videoconferência?')
    if (!confirmed) return
    setConferences((current) => current.filter((conference) => conference.id !== id))
  }

  const markAsCompleted = (id) => {
    editConference(id, { completed: true })
  }

  const reopenConference = (id) => {
    editConference(id, { completed: false })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
    )
    const validationErrors = validateConference(trimmedData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      setMessage('Revise os campos destacados antes de salvar.')
      return
    }

    if (editingId) {
      editConference(editingId, trimmedData)
      setMessage('Videoconferência atualizada com sucesso.')
    } else {
      addConference(trimmedData)
      setMessage('Videoconferência adicionada com sucesso.')
    }

    resetForm()
  }

  const handleEdit = (conference) => {
    setPresentationMode(false)
    setEditingId(conference.id)
    setFormData({
      name: conference.name,
      platform: conference.platform,
      date: conference.date,
      time: conference.time,
      priority: conference.priority,
      responsible: conference.responsible || '',
      department: conference.department || '',
      link: conference.link || '',
      notes: conference.notes || '',
    })
    setErrors({})
    setMessage('Modo de edição ativado.')
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const handleImportJson = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    try {
      const imported = await importJsonBackup(file)
      const confirmed = window.confirm('Deseja substituir os dados atuais pelo backup importado?')
      if (!confirmed) return

      setConferences(imported)
      resetForm()
      setMessage('Backup importado com sucesso.')
    } catch (error) {
      setMessage(error.message || 'Erro ao importar backup.')
    }
  }

  return (
    <div className={presentationMode ? 'app-shell presentation-mode' : 'app-shell'}>
      <main>
        <Dashboard summary={summary} />

        {message && (
          <div className="toast no-print" role="status">
            {message}
            <button type="button" onClick={() => setMessage('')} aria-label="Fechar aviso">
              ×
            </button>
          </div>
        )}

        {!presentationMode && (
          <ConferenceForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            isEditing={Boolean(editingId)}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
          />
        )}

        <section className="agenda-panel">
          <div className="agenda-heading">
            <div>
              <p className="eyebrow">{presentationMode ? 'Modo telão' : 'Agenda'}</p>
              <h2>Videoconferências</h2>
            </div>
            <div className="agenda-tools no-print">
              <button
                className="button secondary presentation-toggle"
                type="button"
                onClick={togglePresentationMode}
              >
                {presentationMode ? <MonitorOff size={17} /> : <Monitor size={17} />}
                {presentationMode ? 'Sair do modo telão' : 'Modo telão'}
              </button>
              {!presentationMode && (
                <ExportActions
                  onExportJson={() => exportJsonBackup(conferences)}
                  onImportJson={handleImportJson}
                  onExportCsv={() => exportCsv(sortedConferences)}
                  onPrint={() => window.print()}
                />
              )}
            </div>
          </div>

          {!presentationMode && (
            <>
              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <Filters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </>
          )}

          <ConferenceList
            conferences={displayedConferences}
            hasConferences={conferences.length > 0}
            actions={{
              onEdit: handleEdit,
              onDelete: deleteConference,
              onComplete: markAsCompleted,
              onReopen: reopenConference,
            }}
          />
        </section>
      </main>
    </div>
  )
}

export default ApprovedAgenda
