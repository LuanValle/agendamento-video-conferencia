import { CalendarDays, CheckCircle2, Clock, ExternalLink, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import {
  formatDateRangePtBr,
  getDateStatusText,
  getSituation,
  getVisualClassByProximity,
} from '../utils/dateUtils'

function ConferenceCard({ conference, onEdit, onDelete, onComplete, onReopen }) {
  const statusClass = getVisualClassByProximity(conference)
  const situation = getSituation(conference)

  return (
    <article className={`conference-card ${statusClass}`}>
      <div className="card-topline">
        <div>
          <h3>{conference.name}</h3>
          <p>{conference.platform}</p>
        </div>
        <div className="badge-group">
          <span className={`priority-badge priority-${conference.priority.toLowerCase()}`}>
            {conference.priority}
          </span>
          <span className={`situation-badge situation-${situation}`}>{getDateStatusText(conference)}</span>
        </div>
      </div>

      <dl className="conference-details">
        <div>
          <dt>
            <CalendarDays size={15} />
            {conference.endDate ? 'Período' : 'Data'}
          </dt>
          <dd>{formatDateRangePtBr(conference.date, conference.endDate)}</dd>
        </div>
        <div>
          <dt>
            <Clock size={15} />
            Horário
          </dt>
          <dd>{conference.time}</dd>
        </div>
        {conference.responsible && (
          <div>
            <dt>Responsável</dt>
            <dd>{conference.responsible}</dd>
          </div>
        )}
        {conference.department && (
          <div>
            <dt>Setor</dt>
            <dd>{conference.department}</dd>
          </div>
        )}
        <div>
          <dt>Situação</dt>
          <dd className="capitalize">{situation}</dd>
        </div>
      </dl>

      {conference.link && (
        <a className="meeting-link" href={conference.link} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={16} />
          Abrir reunião
        </a>
      )}

      {conference.notes && <p className="notes">{conference.notes}</p>}

      {onEdit && onDelete && onComplete && onReopen && (
        <div className="card-actions no-print">
          <button className="icon-button" type="button" onClick={() => onEdit(conference)} title="Editar">
            <Pencil size={17} />
            <span>Editar</span>
          </button>
          {conference.completed ? (
            <button className="icon-button" type="button" onClick={() => onReopen(conference.id)} title="Reabrir">
              <RotateCcw size={17} />
              <span>Reabrir</span>
            </button>
          ) : (
            <button className="icon-button success" type="button" onClick={() => onComplete(conference.id)} title="Concluir">
              <CheckCircle2 size={17} />
              <span>Concluir</span>
            </button>
          )}
          <button className="icon-button danger" type="button" onClick={() => onDelete(conference.id)} title="Excluir">
            <Trash2 size={17} />
            <span>Excluir</span>
          </button>
        </div>
      )}
    </article>
  )
}

export default ConferenceCard
