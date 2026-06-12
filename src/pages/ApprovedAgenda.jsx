import { Monitor, MonitorOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import ConferenceForm, { emptyForm } from '../components/ConferenceForm'
import ConferenceList from '../components/ConferenceList'
import Dashboard from '../components/Dashboard'
import ExportActions from '../components/ExportActions'
import Filters from '../components/Filters'
import SearchBar from '../components/SearchBar'
import { apiToConference, conferenceToApi } from '../utils/apiMappers'
import {
  getSituation,
  isToday,
  isWithinCurrentMonth,
  isWithinCurrentWeek,
  isWithinNext30Days,
  sortByDateAndTime,
} from '../utils/dateUtils'
import { exportCsv, exportJsonBackup, importJsonBackup } from '../utils/exportUtils'
import { useSmartPolling } from '../utils/useSmartPolling'
import { validateConference } from '../utils/validationUtils'

const isHighPriority = (priority) => {
  // Remove acentos para aceitar tanto "Critica" quanto "Critica" com acento.
  const normalized = String(priority || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return ['Alta', 'Critica'].includes(normalized)
}

function filterConferences(conferences, activeFilter) {
  // Cada chave representa um filtro da barra de filtros da agenda.
  const predicates = {
    all: () => true,
    pending: (conference) => getSituation(conference) === 'pendente',
    completed: (conference) => conference.completed,
    expired: (conference) => getSituation(conference) === 'vencida',
    'high-critical': (conference) => isHighPriority(conference.priority),
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

  // Pesquisa nos campos mais importantes exibidos nos cards.
  return conferences.filter((conference) =>
    [
      conference.name,
      conference.platform,
      conference.responsible,
      conference.department,
      conference.notes,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalized),
  )
}

function ApprovedAgenda() {
  const [conferences, setConferences] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [presentationMode, setPresentationMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)

  const fetchConferences = useCallback(async () => {
    try {
      // Busca a agenda real no banco. Essa lista e a fonte da verdade da tela.
      const response = await fetch('/api/videoconferencias')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Nao foi possivel carregar a agenda.')
      }

      // Traduz os nomes do banco para os nomes usados pelos componentes React.
      setConferences((result.data || []).map(apiToConference))
      setLastUpdatedAt(new Date())
    } catch (error) {
      setMessage(error.message)
    }
  }, [])

  // Atualiza enquanto a aba esta ativa e força uma busca ao voltar para a aba.
  useSmartPolling(fetchConferences, 5000)

  useEffect(() => {
    // O modo telao troca classes globais para esconder controles e focar na agenda.
    document.body.classList.toggle('body-presentation-mode', presentationMode)

    if (presentationMode) {
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' }),
      )
    }

    return () => {
      document.body.classList.remove('body-presentation-mode')
    }
  }, [presentationMode])

  const sortedConferences = useMemo(
    () => sortByDateAndTime(conferences),
    [conferences],
  )

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
      highPriority: conferences.filter((conference) => isHighPriority(conference.priority)).length,
    }),
    [conferences],
  )

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setErrors({})
  }

  const deleteConference = async (id) => {
    try {
      setIsDeleting(true)
      setMessage('')

      // DELETE remove a videoconferencia do banco, nao apenas da tela.
      const response = await fetch(`/api/videoconferencias/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'Nao foi possivel excluir a videoconferencia.')
        return
      }

      // Recarrega a lista para mostrar exatamente o que ficou salvo no Neon.
      await fetchConferences()
      setMessage('Videoconferencia excluida com sucesso.')
      setConfirmingDeleteId(null)
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir videoconferencia.')
    } finally {
      setIsDeleting(false)
    }
  }

  const updateConferenceCompletion = async (id, completed) => {
    // Como a API de PATCH recebe o registro inteiro, primeiro pegamos os dados atuais.
    const conference = conferences.find((item) => item.id === id)

    if (!conference) {
      setMessage('Videoconferencia nao encontrada na tela.')
      return
    }

    try {
      setMessage('')

      // Monta uma copia da videoconferencia alterando apenas o campo completed.
      const updatedConference = {
        ...conference,
        completed,
      }

      const response = await fetch(`/api/videoconferencias/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conferenceToApi(updatedConference)),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage(result.error || 'Nao foi possivel atualizar a videoconferencia.')
        return
      }

      await fetchConferences()
      setMessage(completed ? 'Videoconferencia marcada como concluida.' : 'Videoconferencia reaberta.')
    } catch (error) {
      setMessage(error.message || 'Erro ao atualizar videoconferencia.')
    }
  }

  const markAsCompleted = (id) => {
    updateConferenceCompletion(id, true)
  }

  const reopenConference = (id) => {
    updateConferenceCompletion(id, false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSaving) return

    // Remove espacos extras antes de validar e enviar os dados.
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ]),
    )

    const validationErrors = validateConference(trimmedData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length) {
      setMessage('Revise os campos destacados antes de salvar.')
      return
    }

    setIsSaving(true)

    try {
      if (editingId) {
        // PATCH atualiza uma videoconferencia que ja existe no banco.
        const response = await fetch(`/api/videoconferencias/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conferenceToApi(trimmedData)),
        })

        const result = await response.json()

        if (!response.ok) {
          setMessage(result.error || 'Nao foi possivel atualizar a videoconferencia.')
          return
        }

        await fetchConferences()
        setMessage('Videoconferencia atualizada com sucesso.')
      } else {
        // POST cria uma videoconferencia nova diretamente como aprovada.
        const response = await fetch('/api/videoconferencias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conferenceToApi(trimmedData)),
        })

        const result = await response.json()

        if (!response.ok) {
          setMessage(result.error || 'Nao foi possivel adicionar a videoconferencia.')
          return
        }

        await fetchConferences()
        setMessage('Videoconferencia adicionada com sucesso.')
      }

      resetForm()
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar videoconferencia.')
    } finally {
      setIsSaving(false)
    }
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
    setMessage('Modo de edicao ativado.')
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: 'smooth' }),
    )
  }

  const handleImportJson = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    try {
      // A importacao ainda valida o arquivo, mas nao substitui o banco automaticamente.
      // Isso evita apagar dados reais por acidente durante a migracao para Neon.
      await importJsonBackup(file)
      setMessage('Backup lido com sucesso. A importacao para o banco sera tratada em uma etapa propria.')
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
              x
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
            isSaving={isSaving}
          />
        )}

        <section className="agenda-panel">
          <div className="agenda-heading">
            <div>
              <p className="eyebrow">{presentationMode ? 'Modo telao' : 'Agenda'}</p>
              <h2>Videoconferencias</h2>
              {lastUpdatedAt && (
                <span className="last-updated">
                  Atualizado às {lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <div className="agenda-tools no-print">
              <button
                className="button secondary presentation-toggle"
                type="button"
                onClick={() => setPresentationMode((current) => !current)}
              >
                {presentationMode ? <MonitorOff size={17} /> : <Monitor size={17} />}
                {presentationMode ? 'Sair do modo telao' : 'Modo telao'}
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
              onDelete: setConfirmingDeleteId,
              onComplete: markAsCompleted,
              onReopen: reopenConference,
            }}
          />
        </section>

        {confirmingDeleteId && (
          <ConfirmModal
            title="Excluir videoconferência"
            message="Deseja excluir esta videoconferência? Essa ação remove o registro do banco."
            confirmLabel="Excluir"
            variant="danger"
            isLoading={isDeleting}
            onConfirm={() => deleteConference(confirmingDeleteId)}
            onCancel={() => setConfirmingDeleteId(null)}
          />
        )}
      </main>
    </div>
  )
}

export default ApprovedAgenda
