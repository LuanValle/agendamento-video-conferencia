export function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '')
}

export function isValidNip(value) {
    // Aceita somente NIP com 8 digitos: exibido no frontend como 19.0485.56.
    return onlyDigits(value).length === 8
}

export function normalizeSector(value) {
    return String(value || '').trim().toUpperCase()
}

export function isValidContact(value) {
    // Aceita telefones com DDD: 10 ou 11 digitos numericos.
    const digits = onlyDigits(value)
    return digits.length === 10 || digits.length === 11
}

export function isValidUrlOrEmpty(value) {
    if (!value) return true

    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol)
    } catch {
        return false
    }
}

export function isPastDate(value) {
    if (!value) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const date = new Date(`${value}T00:00:00`)
    return Number.isNaN(date.getTime()) || date < today
}

export function isCompletionOnlyPatch(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false

    const keys = Object.keys(value)
    return keys.length === 1
        && keys[0] === 'concluida'
        && typeof value.concluida === 'boolean'
}
