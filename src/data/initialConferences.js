const today = new Date()

const toDateInput = (date) => date.toISOString().slice(0, 10)

const addDays = (days) => {
  const date = new Date(today)
  date.setDate(today.getDate() + days)
  return toDateInput(date)
}

export const initialConferences = [
  {
    id: crypto.randomUUID(),
    name: 'Reunião de alinhamento semanal',
    platform: 'Google Meet',
    date: addDays(2),
    time: '09:00',
    priority: 'Média',
    responsible: 'Marina Costa',
    department: 'Operações',
    link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Revisar entregas da semana e próximos bloqueios.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Videoconferência com setor administrativo',
    platform: 'Microsoft Teams',
    date: addDays(6),
    time: '14:30',
    priority: 'Baixa',
    responsible: 'Paulo Mendes',
    department: 'Administrativo',
    link: 'https://teams.microsoft.com/l/meetup-join/exemplo',
    notes: 'Atualização de rotinas internas.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Apresentação de relatório',
    platform: 'Zoom',
    date: addDays(12),
    time: '10:15',
    priority: 'Alta',
    responsible: 'Renata Alves',
    department: 'Financeiro',
    link: 'https://zoom.us/j/123456789',
    notes: 'Levar indicadores consolidados do trimestre.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: 'Reunião crítica com chefia',
    platform: 'Presencial',
    date: addDays(0),
    time: '16:00',
    priority: 'Crítica',
    responsible: 'Diretoria',
    department: 'Gestão',
    link: '',
    notes: 'Pauta prioritária com decisões pendentes.',
    completed: false,
    createdAt: new Date().toISOString(),
  },
]
