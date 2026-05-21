import { isToday } from './dateUtils.js'
import { loadRequests } from './requestStorage.js'

export const getRequestSummary = () => {
  const requests = loadRequests()

  return {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pendente').length,
    completed: requests.filter((request) => request.status === 'aprovada').length,
    expired: requests.filter((request) => request.status === 'rejeitada').length,
    today: requests.filter((request) => isToday(request.date)).length,
    highPriority: requests.filter((request) => ['Alta', 'Crítica'].includes(request.priority)).length,
  }
}

export const requestToConference = (request) => ({
  name: request.conferenceName,
  platform: request.platform,
  date: request.date,
  time: request.time,
  priority: request.priority,
  responsible: request.name,
  department: request.department,
  link: request.link || '',
  notes: request.notes || `Solicitado por ${request.name} - contato: ${request.contact}`,
})
