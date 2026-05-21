import { CheckCircle2, XCircle } from 'lucide-react'
import { formatDatePtBr } from '../utils/dateUtils'

function RequestCard({ request, onApprove, onReject }) {
  return (
    <article className={`request-card request-${request.status}`}>
      <div className="card-topline">
        <div>
          <h3>{request.name}</h3>
          <p>
            {request.department} • NIP {request.nip}
          </p>
        </div>
        <span className={`situation-badge situation-${request.status}`}>{request.status}</span>
      </div>

      <dl className="conference-details">
        <div>
          <dt>Videoconferência</dt>
          <dd>{request.conferenceName}</dd>
        </div>
        <div>
          <dt>Local/Plataforma</dt>
          <dd>{request.platform}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>{formatDatePtBr(request.date)}</dd>
        </div>
        <div>
          <dt>Horário</dt>
          <dd>{request.time}</dd>
        </div>
        <div>
          <dt>Prioridade</dt>
          <dd>{request.priority}</dd>
        </div>
        <div>
          <dt>Contato</dt>
          <dd>{request.contact}</dd>
        </div>
      </dl>

      {request.notes && <p className="notes">{request.notes}</p>}
      {request.rejectionReason && <p className="notes rejection-reason">Motivo: {request.rejectionReason}</p>}

      {request.status === 'pendente' && (
        <div className="card-actions">
          <button className="icon-button success" type="button" onClick={() => onApprove(request)}>
            <CheckCircle2 size={17} />
            <span>Aprovar</span>
          </button>
          <button className="icon-button danger" type="button" onClick={() => onReject(request)}>
            <XCircle size={17} />
            <span>Rejeitar</span>
          </button>
        </div>
      )}
    </article>
  )
}

export default RequestCard
