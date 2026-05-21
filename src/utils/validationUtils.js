const requiredFields = [
  ['name', 'Nome da videoconferência é obrigatório.'],
  ['platform', 'Local ou plataforma é obrigatório.'],
  ['date', 'Data é obrigatória.'],
  ['time', 'Horário é obrigatório.'],
  ['priority', 'Prioridade é obrigatória.'],
]

export const isValidUrl = (value) => {
  if (!value) return true

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export const validateConference = (conference) => {
  const errors = {}

  requiredFields.forEach(([field, message]) => {
    if (!conference[field]?.trim()) errors[field] = message
  })

  if (conference.link?.trim() && !isValidUrl(conference.link.trim())) {
    errors.link = 'Informe uma URL válida começando com http:// ou https://.'
  }

  return errors
}

const validPriorities = ['Baixa', 'Média', 'Alta', 'Crítica']
const validPlatforms = ['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'UNA', 'Presencial', 'Outro']

const isStringOrMissing = (value) => value === undefined || typeof value === 'string'
const isBooleanOrMissing = (value) => value === undefined || typeof value === 'boolean'

const isValidConferenceShape = (item) => {
  if (!item || typeof item !== 'object') return false

  const hasRequiredStrings =
    typeof item.name === 'string' &&
    typeof item.platform === 'string' &&
    typeof item.date === 'string' &&
    typeof item.time === 'string' &&
    typeof item.priority === 'string'

  if (!hasRequiredStrings) return false
  if (!item.name.trim() || !item.platform.trim() || !item.date.trim() || !item.time.trim()) return false
  if (!validPlatforms.includes(item.platform)) return false
  if (!validPriorities.includes(item.priority)) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return false
  if (!/^\d{2}:\d{2}$/.test(item.time)) return false
  if (item.link && !isValidUrl(item.link)) return false

  return (
    isStringOrMissing(item.id) &&
    isStringOrMissing(item.responsible) &&
    isStringOrMissing(item.department) &&
    isStringOrMissing(item.link) &&
    isStringOrMissing(item.notes) &&
    isStringOrMissing(item.createdAt) &&
    isBooleanOrMissing(item.completed)
  )
}

export const validateBackupStructure = (data) =>
  Array.isArray(data) && data.every(isValidConferenceShape)
