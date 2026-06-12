import { requireAdmin } from './_auth.js'
import { sql } from './_db.js'
import { readJsonBody, sendJsonParseError } from './_request.js'
import { isPastDate, isValidUrlOrEmpty, normalizeSector } from './_validators.js'

const camposObrigatorios = ['nome', 'plataforma', 'data', 'horario', 'prioridade']

function temCampoObrigatorioVazio(dados) {
    return camposObrigatorios.some((campo) => !dados[campo] || !String(dados[campo]).trim())
}

async function listarVideoconferencias(request, response) {
    // A agenda é administrativa, então a listagem também exige login.
    if (requireAdmin(request, response)) return

    const videoconferencias = await sql`
        SELECT *
        FROM videoconferencias
        ORDER BY concluida ASC, data ASC, horario ASC
    `

    return response.status(200).json({
        data: videoconferencias,
    })
}

async function criarVideoconferencia(request, response) {
    if (requireAdmin(request, response)) return

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

    // Impede cadastro duplicado da mesma reunião no mesmo dia e horário.
    const [duplicada] = await sql`
        SELECT id
        FROM videoconferencias
        WHERE nome = ${nome.trim()}
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
        INSERT INTO videoconferencias (
            nome,
            plataforma,
            data,
            horario,
            prioridade,
            responsavel,
            setor,
            link,
            observacoes
        )
        VALUES (
            ${nome.trim()},
            ${plataforma.trim()},
            ${data.trim()},
            ${horario.trim()},
            ${prioridade.trim()},
            ${responsavel?.trim() || null},
            ${setor || null},
            ${link?.trim() || null},
            ${observacoes?.trim() || null}
        )
        RETURNING *
    `

    return response.status(201).json({
        message: 'Videoconferência criada com sucesso.',
        data: videoconferencia,
    })
}

export default async function handler(request, response) {
    try {
        if (request.method === 'GET') return listarVideoconferencias(request, response)
        if (request.method === 'POST') return criarVideoconferencia(request, response)

        return response.status(405).json({
            error: 'Método não permitido. Use GET ou POST.',
        })
    } catch (error) {
        if (error instanceof SyntaxError) return sendJsonParseError(response)

        return response.status(500).json({
            error: 'Ocorreu um erro ao processar a solicitação.',
            details: error.message,
        })
    }
}
