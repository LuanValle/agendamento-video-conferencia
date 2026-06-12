import { requireAdmin } from '../_auth.js'
import { sql } from '../_db.js'
import { readJsonBody, sendJsonParseError } from '../_request.js'
import { isPastDate, isValidUrlOrEmpty, normalizeSector } from '../_validators.js'

const camposObrigatorios = ['nome', 'plataforma', 'data', 'horario', 'prioridade']

function temCampoObrigatorioVazio(dados) {
    return camposObrigatorios.some((campo) => !dados[campo] || !String(dados[campo]).trim())
}

async function atualizarVideoconferencia(request, response) {
    if (requireAdmin(request, response)) return

    const { id } = request.query
    const body = readJsonBody(request)

    if (temCampoObrigatorioVazio(body)) {
        return response.status(400).json({
            error: 'Preencha todos os campos obrigatórios.',
        })
    }

    const {
        nome,
        plataforma,
        data,
        horario,
        prioridade,
        responsavel,
        link,
        observacoes,
        concluida,
    } = body

    const setor = normalizeSector(body.setor)

    if (isPastDate(data)) {
        return response.status(400).json({
            error: 'A data não pode ser anterior à data atual.',
        })
    }

    if (!isValidUrlOrEmpty(link?.trim())) {
        return response.status(400).json({
            error: 'Informe uma URL válida começando com http:// ou https://.',
        })
    }

    // Evita editar uma reunião para ficar igual a outra já cadastrada.
    const [duplicada] = await sql`
        SELECT id
        FROM videoconferencias
        WHERE id <> ${id}
          AND nome = ${nome.trim()}
          AND plataforma = ${plataforma.trim()}
          AND data = ${data.trim()}
          AND horario = ${horario.trim()}
        LIMIT 1
    `

    if (duplicada) {
        return response.status(409).json({
            error: 'Já existe uma videoconferência igual neste dia e horário.',
        })
    }

    const [videoconferencia] = await sql`
        UPDATE videoconferencias
        SET nome = ${nome.trim()},
            plataforma = ${plataforma.trim()},
            data = ${data.trim()},
            horario = ${horario.trim()},
            prioridade = ${prioridade.trim()},
            responsavel = ${responsavel?.trim() || null},
            setor = ${setor || null},
            link = ${link?.trim() || null},
            observacoes = ${observacoes?.trim() || null},
            concluida = ${Boolean(concluida)},
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
    `

    if (!videoconferencia) {
        return response.status(404).json({
            error: 'Videoconferência não encontrada.',
        })
    }

    return response.status(200).json({
        message: 'Videoconferência atualizada com sucesso.',
        data: videoconferencia,
    })
}

async function excluirVideoconferencia(request, response) {
    if (requireAdmin(request, response)) return

    const { id } = request.query

    const [videoconferencia] = await sql`
        DELETE FROM videoconferencias
        WHERE id = ${id}
        RETURNING *
    `

    if (!videoconferencia) {
        return response.status(404).json({
            error: 'Videoconferência não encontrada.',
        })
    }

    return response.status(200).json({
        message: 'Videoconferência excluída com sucesso.',
        data: videoconferencia,
    })
}

export default async function handler(request, response) {
    try {
        if (request.method === 'PATCH') return atualizarVideoconferencia(request, response)
        if (request.method === 'DELETE') return excluirVideoconferencia(request, response)

        return response.status(405).json({
            error: 'Método não permitido.',
        })
    } catch (error) {
        if (error instanceof SyntaxError) return sendJsonParseError(response)

        return response.status(500).json({
            error: 'Erro interno.',
            details: error.message,
        })
    }
}
