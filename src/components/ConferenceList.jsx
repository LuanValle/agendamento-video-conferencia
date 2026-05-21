import ConferenceCard from './ConferenceCard'
import EmptyState from './EmptyState'
import { combineDateAndTime, formatDatePtBr, isToday } from '../utils/dateUtils'

const getDateGroupTitle = (date) => {
  const formatted = formatDatePtBr(date)
  return isToday(date) ? `Hoje - ${formatted}` : formatted
}

const groupConferencesByDate = (conferences) => {
  const groups = conferences.reduce((accumulator, conference) => {
    const existing = accumulator.get(conference.date) || []
    accumulator.set(conference.date, [...existing, conference])
    return accumulator
  }, new Map())

  return [...groups.entries()]
    .sort(([dateA], [dateB]) => new Date(`${dateA}T12:00:00`) - new Date(`${dateB}T12:00:00`))
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return combineDateAndTime(a.date, a.time) - combineDateAndTime(b.date, b.time)
      }),
    }))
}

function ConferenceList({ conferences, hasConferences, actions = {} }) {
  if (!conferences.length) {
    return <EmptyState hasConferences={hasConferences} />
  }

  const groupedConferences = groupConferencesByDate(conferences)

  return (
    <section className="conference-list" aria-label="Lista de videoconferências">
      {groupedConferences.map((group) => (
        <section className="date-group" key={group.date} aria-label={`Videoconferências de ${formatDatePtBr(group.date)}`}>
          <header className="date-group-header">
            <div>
              <p className="eyebrow">Data</p>
              <h3>{getDateGroupTitle(group.date)}</h3>
            </div>
            <span>
              {group.items.length} {group.items.length === 1 ? 'videoconferência' : 'videoconferências'}
            </span>
          </header>
          <div className="date-group-items">
            {group.items.map((conference) => (
              <ConferenceCard key={conference.id} conference={conference} {...actions} />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

export default ConferenceList
