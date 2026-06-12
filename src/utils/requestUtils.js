import { isToday } from './dateUtils.js'

const isHighPriority = (priority) => {
  // Remove acentos para contar prioridades criticas mesmo quando vierem com grafias diferentes.
  const normalized = String(priority || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return ['Alta', 'Critica'].includes(normalized)
}

// Monta os numeros exibidos no dashboard administrativo usando dados vindos do banco.
export const getRequestSummary = (requests) => ({
  total: requests.length,
  pending: requests.filter((request) => request.status === 'pendente').length,
  completed: requests.filter((request) => request.status === 'aprovada').length,
  expired: requests.filter((request) => request.status === 'rejeitada').length,
  today: requests.filter((request) => isToday(request.date)).length,
  highPriority: requests.filter((request) => isHighPriority(request.priority)).length,
})

// Converte uma solicitacao publica aprovada em uma videoconferencia da agenda.
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
