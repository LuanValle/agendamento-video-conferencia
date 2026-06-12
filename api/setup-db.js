import { sql } from './_db.js'

export default async function handler(request, response) {
    try {
        await sql
            `CREATE TABLE IF NOT EXISTS solicitacoes(
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            nip TEXT NOT NULL,
            setor TEXT NOT NULL,
            contato TEXT NOT NULL,
            nome_videoconferencia TEXT NOT NULL,
            local_plataforma TEXT NOT NULL,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            prioridade TEXT NOT NULL,
            link TEXT,
            observacoes TEXT,
            status TEXT NOT NULL DEFAULT 'pendente',
            motivo_rejeicao TEXT,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            atualizado_em TIMESTAMP
        )`
        await sql`
        CREATE TABLE IF NOT EXISTS videoconferencias (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            plataforma TEXT NOT NULL,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            prioridade TEXT NOT NULL,
            responsavel TEXT,
            setor TEXT,
            link TEXT,
            observacoes TEXT,
            concluida BOOLEAN NOT NULL DEFAULT false,
            solicitacao_id INTEGER REFERENCES solicitacoes(id),
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP
        )`

        return response.status(200).json({
            status: 'ok',
            message: 'Banco de dados configurado com sucesso.',
        })
    } catch (error) {
        return response.status(500).json({
            status: 'error',
            message: error.message,
        })
    }
}