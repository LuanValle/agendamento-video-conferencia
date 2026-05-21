import assert from 'node:assert/strict'
import {
  calculateDaysRemaining,
  combineDateAndTime,
  formatDatePtBr,
  getDateStatusText,
  getSituation,
  getVisualClassByProximity,
  isExpired,
  isToday,
  isWithinNext30Days,
  sortByDateAndTime,
} from '../src/utils/dateUtils.js'
import { isValidUrl, validateBackupStructure, validateConference } from '../src/utils/validationUtils.js'
import { buildCsvContent } from '../src/utils/exportUtils.js'
import { requestToConference } from '../src/utils/requestUtils.js'

const toDateInput = (date) => date.toISOString().slice(0, 10)

const addDays = (days) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return toDateInput(date)
}

const today = addDays(0)
const tomorrow = addDays(1)
const nextWeek = addDays(8)
const yesterday = addDays(-1)

assert.equal(combineDateAndTime('2026-05-21', '14:30').getHours(), 14)
assert.equal(calculateDaysRemaining(today), 0)
assert.equal(calculateDaysRemaining(tomorrow), 1)
assert.equal(isToday(today), true)
assert.equal(isWithinNext30Days(addDays(30)), true)
assert.equal(isWithinNext30Days(addDays(31)), false)
assert.match(formatDatePtBr('2026-05-21'), /21\/05\/2026/)

assert.equal(
  getDateStatusText({ date: today, time: '23:59', completed: false }),
  'É hoje',
)
assert.equal(
  getDateStatusText({ date: tomorrow, time: '09:00', completed: false }),
  'Falta 1 dia',
)
assert.equal(
  getDateStatusText({ date: nextWeek, time: '09:00', completed: true }),
  'Concluída',
)

assert.equal(isExpired({ date: yesterday, time: '23:59', completed: false }), true)
assert.equal(getSituation({ date: yesterday, time: '23:59', completed: false }), 'vencida')
assert.equal(getSituation({ date: tomorrow, time: '09:00', completed: false }), 'pendente')
assert.equal(getSituation({ date: tomorrow, time: '09:00', completed: true }), 'concluida')

assert.equal(getVisualClassByProximity({ date: today, time: '23:59', completed: false }), 'status-today')
assert.equal(getVisualClassByProximity({ date: addDays(2), time: '09:00', completed: false }), 'status-urgent')
assert.equal(getVisualClassByProximity({ date: addDays(5), time: '09:00', completed: false }), 'status-warning')
assert.equal(getVisualClassByProximity({ date: addDays(10), time: '09:00', completed: false }), 'status-neutral')
assert.equal(getVisualClassByProximity({ date: tomorrow, time: '09:00', completed: true }), 'status-completed')

const sorted = sortByDateAndTime([
  { id: 'completed', date: today, time: '08:00', completed: true },
  { id: 'later', date: tomorrow, time: '09:00', completed: false },
  { id: 'first', date: today, time: '07:00', completed: false },
  { id: 'second', date: today, time: '08:00', completed: false },
])

assert.deepEqual(
  sorted.map((item) => item.id),
  ['first', 'second', 'later', 'completed'],
)

assert.equal(isValidUrl('https://example.com/reuniao'), true)
assert.equal(isValidUrl('http://example.com/reuniao'), true)
assert.equal(isValidUrl('ftp://example.com'), false)
assert.equal(isValidUrl('texto solto'), false)
assert.equal(isValidUrl(''), true)

assert.deepEqual(validateConference({ name: '', platform: '', date: '', time: '', priority: '', link: '' }), {
  name: 'Nome da videoconferência é obrigatório.',
  platform: 'Local ou plataforma é obrigatório.',
  date: 'Data é obrigatória.',
  time: 'Horário é obrigatório.',
  priority: 'Prioridade é obrigatória.',
})

assert.deepEqual(
  validateConference({
    name: 'Reunião',
    platform: 'Zoom',
    date: today,
    time: '10:00',
    priority: 'Alta',
    link: 'https://zoom.us/j/1',
  }),
  {},
)

assert.equal(
  validateBackupStructure([
    {
      name: 'Reunião',
      platform: 'Zoom',
      date: today,
      time: '10:00',
      priority: 'Alta',
    },
  ]),
  true,
)
assert.equal(validateBackupStructure({ name: 'Inválido' }), false)
assert.equal(
  validateBackupStructure([
    {
      name: 'Reunião Webex',
      platform: 'Webex',
      date: today,
      time: '10:00',
      priority: 'Alta',
    },
    {
      name: 'Reunião UNA',
      platform: 'UNA',
      date: tomorrow,
      time: '14:00',
      priority: 'Média',
    },
  ]),
  true,
)
assert.equal(validateBackupStructure([{ name: 'Sem campos' }]), false)
assert.equal(
  validateBackupStructure([
    {
      name: 'Reunião',
      platform: 'Zoom',
      date: today,
      time: '10:00',
      priority: 'Urgente',
    },
  ]),
  false,
)
assert.equal(
  validateBackupStructure([
    {
      name: 'Reunião',
      platform: 'Zoom',
      date: today,
      time: '10:00',
      priority: 'Alta',
      link: 'link inválido',
    },
  ]),
  false,
)

const csv = buildCsvContent([
  {
    name: 'Reunião "Especial"',
    platform: 'Zoom',
    date: tomorrow,
    time: '10:00',
    priority: 'Alta',
    responsible: 'Ana',
    department: 'TI',
    link: 'https://zoom.us/j/1',
    completed: false,
    notes: 'Linha; com separador',
  },
])

assert.equal(csv.startsWith('\uFEFF"Nome";'), true)
assert.equal(csv.includes('"Reunião ""Especial"""'), true)
assert.equal(csv.includes('"Linha; com separador"'), true)
assert.equal(csv.includes('"pendente"'), true)

assert.deepEqual(
  requestToConference({
    name: 'Solicitante',
    conferenceName: 'Reunião solicitada',
    platform: 'Webex',
    date: tomorrow,
    time: '15:30',
    priority: 'Crítica',
    department: 'Operações',
    contact: '9999-9999',
    link: '',
    notes: '',
  }),
  {
    name: 'Reunião solicitada',
    platform: 'Webex',
    date: tomorrow,
    time: '15:30',
    priority: 'Crítica',
    responsible: 'Solicitante',
    department: 'Operações',
    link: '',
    notes: 'Solicitado por Solicitante - contato: 9999-9999',
  },
)

console.log('Todos os testes passaram.')
