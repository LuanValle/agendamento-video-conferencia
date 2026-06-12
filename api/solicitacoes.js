import { requireAdmin } from './_auth.js'
import { sql } from './_db.js'
import { readJsonBody, sendJsonParseError } from './_request.js'
import { isPastDate, isValidContact, isValidNip, isValidUrlOrEmpty, normalizeSector } from './_validators.js'

const camposObrigatorios = [
    'nome',
    'nip',
    'setor',
    'contato',
    'nome_videoconferencia',
    'local_plataforma',
    'data',
    'horario',
    'prioridade',
]

function temCampoObrigatorioVazio(dados) {
    return camposObrigatorios.some((campo) => !dados[campo] || !String(dados[campo]).trim())
}

async function listarSolicitacoes(request, response) {
    // Listar solicitacoes e uma acao administrativa, por isso exige login.
    if (requireAdmin(request, response)) return

    const solicitacoes = await sql`
        SELECT *
        FROM solicitacoes
        ORDER BY criado_em DESC
    `

    return response.status(200).json({
        data: solicitacoes,
    })
}

async function criarSolicitacao(request, response) {
    const body = readJsonBody(request)

    if (temCampoObrigatorioVazio(body)) {
        return response.status(400).json({
            error: 'Preencha todos os campos obrigatórios.',
        })
    }

    const {
        nome,
        nip,
        contato,
        nome_videoconferencia,
        local_plataforma,
        data,
        horario,
        prioridade,
        link,
        observacoes,
    } = body

    const setor = normalizeSector(body.setor)

    if (!isValidNip(nip)) {
        return response.status(400).json({
            error: 'Informe o NIP no formato 19.0485.56.',
        })
    }

    if (!isValidContact(contato)) {
        return response.status(400).json({
            error: 'Informe o contato com DDD.',
        })
    }

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

    // Evita envio duplo da mesma solicitação pendente.
    const [solicitacaoDuplicada] = await sql`
        SELECT id
        FROM solicitacoes
        WHERE status = 'pendente'
          AND nip = ${nip.trim()}
          AND nome_videoconferencia = ${nome_videoconferencia.trim()}
          AND data = ${data.trim()}
          AND horario = ${horario.trim()}
        LIMIT 1
    `

    if (solicitacaoDuplicada) {
        return response.status(409).json({
            error: 'Já existe uma solicitação pendente igual a esta.',
        })
    }

    const [novaSolicitacao] = await sql`
        INSERT INTO solicitacoes (
            nome,
            nip,
            setor,
            contato,
            nome_videoconferencia,
            local_plataforma,
            data,
            horario,
            prioridade,
            link,
            observacoes
        ) VALUES (
            ${nome.trim()},
            ${nip.trim()},
            ${setor},
            ${contato.trim()},
            ${nome_videoconferencia.trim()},
            ${local_plataforma.trim()},
            ${data.trim()},
            ${horario.trim()},
            ${prioridade.trim()},
            ${link?.trim() || null},
            ${observacoes?.trim() || null}
        )
        RETURNING *
    `

    return response.status(201).json({
        data: novaSolicitacao,
        message: 'Solicitação criada com sucesso.',
    })
}

export default async function handler(request, response) {
    try {
        if (request.method === 'GET') return listarSolicitacoes(request, response)
        if (request.method === 'POST') return criarSolicitacao(request, response)

        return response.status(405).json({
            error: 'Método não permitido.',
        })
    } catch (error) {
        if (error instanceof SyntaxError) return sendJsonParseError(response)

        return response.status(500).json({
            error: error.message,
        })
    }
}
