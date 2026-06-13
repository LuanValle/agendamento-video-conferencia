import { sql } from './_db.js'

let videoconferenciaSchemaReady = false

export async function ensureVideoconferenciaSchema() {
    if (videoconferenciaSchemaReady) return

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
        CREATE INDEX IF NOT EXISTS idx_videoconferencias_periodo
        ON videoconferencias (concluida, data, data_fim, horario)
    `

    videoconferenciaSchemaReady = true
}
