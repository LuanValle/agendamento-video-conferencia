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
            email_responsavel TEXT,
            nome_videoconferencia TEXT NOT NULL,
            local_plataforma TEXT NOT NULL,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            prioridade TEXT NOT NULL,
            link TEXT,
            solicitar_link BOOLEAN NOT NULL DEFAULT false,
            observacoes TEXT,
            status TEXT NOT NULL DEFAULT 'pendente',
            motivo_rejeicao TEXT,
            criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            atualizado_em TIMESTAMP
        )`
        await sql`
            ALTER TABLE solicitacoes
            ADD COLUMN IF NOT EXISTS email_responsavel TEXT
        `
        await sql`
            ALTER TABLE solicitacoes
            ADD COLUMN IF NOT EXISTS solicitar_link BOOLEAN NOT NULL DEFAULT false
        `
        await sql`
        CREATE TABLE IF NOT EXISTS videoconferencias (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            plataforma TEXT NOT NULL,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            data_fim DATE,
            prioridade TEXT NOT NULL,
            responsavel TEXT,
            setor TEXT,
            link TEXT,
            observacoes TEXT,
            concluida BOOLEAN NOT NULL DEFAULT false,
            solicitacao_id INTEGER REFERENCES solicitacoes(id),
            recurrence_group_id TEXT,
            recurrence_type TEXT,
            criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP
        )`
        await sql`
            ALTER TABLE videoconferencias
            ADD COLUMN IF NOT EXISTS data_fim DATE
        `
        await sql`
            ALTER TABLE videoconferencias
            ADD COLUMN IF NOT EXISTS recurrence_group_id TEXT
        `
        await sql`
            ALTER TABLE videoconferencias
            ADD COLUMN IF NOT EXISTS recurrence_type TEXT
        `
        await sql`
            CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_criado
            ON solicitacoes (status, criado_em DESC)
        `
        await sql`
            CREATE INDEX IF NOT EXISTS idx_solicitacoes_duplicidade_pendente
            ON solicitacoes (nip, nome_videoconferencia, data, horario)
            WHERE status = 'pendente'
        `
        await sql`
            CREATE INDEX IF NOT EXISTS idx_videoconferencias_agenda
            ON videoconferencias (concluida, data, horario)
        `
        await sql`
            CREATE INDEX IF NOT EXISTS idx_videoconferencias_periodo
            ON videoconferencias (concluida, data, data_fim, horario)
        `
        await sql`
            CREATE INDEX IF NOT EXISTS idx_videoconferencias_duplicidade
            ON videoconferencias (nome, plataforma, data, horario)
        `

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
