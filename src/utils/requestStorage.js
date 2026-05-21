const REQUESTS_KEY = 'agendamento-video-conferencia:requests'

export const loadRequests = () => {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const saveRequests = (requests) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
}

export const addRequest = (request) => {
  const requests = loadRequests()
  const newRequest = {
    ...request,
    id: crypto.randomUUID(),
    status: 'pendente',
    createdAt: new Date().toISOString(),
    rejectionReason: '',
  }

  saveRequests([newRequest, ...requests])
  return newRequest
}

export const updateRequestStatus = (id, status, extra = {}) => {
  const updated = loadRequests().map((request) =>
    request.id === id ? { ...request, status, ...extra, updatedAt: new Date().toISOString() } : request,
  )
  saveRequests(updated)
  return updated
}

export const deleteRequest = (id) => {
  const updated = loadRequests().filter((request) => request.id !== id)
  saveRequests(updated)
  return updated
}
