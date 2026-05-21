import { initialConferences } from '../data/initialConferences'

const STORAGE_KEY = 'agendamento-video-conferencia:conferences'
const SEED_KEY = 'agendamento-video-conferencia:seeded'

export const loadConferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored && !localStorage.getItem(SEED_KEY)) {
      saveConferences(initialConferences)
      localStorage.setItem(SEED_KEY, 'true')
      return initialConferences
    }

    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const saveConferences = (conferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conferences))
}

export const clearConferences = () => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(SEED_KEY)
}
