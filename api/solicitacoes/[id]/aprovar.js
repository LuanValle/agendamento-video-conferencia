import { requireAdmin } from '../../_auth.js'
import { sql } from '../../_db.js'

export default async function handler(request, response) {
    if (request.method !== 'PATCH') {
        return response.status(405).json({
            error: 'Método não permitido.',
        })
    }

    if (requireAdmin(request, response)) return

    const { id } = request.query

    try {
        const [solicitacao] = await sql`
            SELECT *
            FROM solicitacoes
            WHERE id = ${id}
        `

        if (!solicitacao) {
            return response.status(404).json({
                error: 'Solicitação não encontrada.',
            })
        }

        if (solicitacao.status !== 'pendente') {
            return response.status(400).json({
                error: 'Apenas solicitações pendentes podem ser aprovadas.',
            })
        }

        // Garante que a mesma solicitação não gere duas videoconferências.
        const [jaAprovada] = await sql`
            SELECT id
            FROM videoconferencias
            WHERE solicitacao_id = ${solicitacao.id}
            LIMIT 1
        `

        if (jaAprovada) {
            return response.status(409).json({
                error: 'Esta solicitação já gerou uma videoconferência.',
            })
        }

        // Evita aprovar uma solicitação que conflita com outra reunião igual.
        const [duplicada] = await sql`
            SELECT id
            FROM videoconferencias
            WHERE nome = ${solicitacao.nome_videoconferencia}
              AND plataforma = ${solicitacao.local_plataforma}
              AND data = ${solicitacao.data}
              AND horario = ${solicitacao.horario}
            LIMIT 1
        `

        if (duplicada) {
            return response.status(409).json({
                error: 'Já existe uma videoconferência igual neste dia e horário.',
            })
        }

        const [videoconferencia] = await sql`
            INSERT INTO videoconferencias (
                nome,
                plataforma,
                data,
                horario,
                prioridade,
                responsavel,
                setor,
                link,
                observacoes,
                solicitacao_id
            )
            VALUES (
                ${solicitacao.nome_videoconferencia},
                ${solicitacao.local_plataforma},
                ${solicitacao.data},
                ${solicitacao.horario},
                ${solicitacao.prioridade},
                ${solicitacao.nome},
                ${solicitacao.setor},
                ${solicitacao.link},
                ${solicitacao.observacoes},
                ${solicitacao.id}
            )
            RETURNING *
        `

        const [solicitacaoAtualizada] = await sql`
            UPDATE solicitacoes
            SET status = 'aprovada', atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
        `

        return response.status(200).json({
            message: 'Solicitação aprovada com sucesso.',
            data: {
                solicitacao: solicitacaoAtualizada,
                videoconferencia,
            },
        })
    } catch (error) {
        return response.status(500).json({
            error: 'Erro ao aprovar solicitação.',
            details: error.message,
        })
    }
}
