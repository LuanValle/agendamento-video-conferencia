export const onlyDigits = (value) => String(value || '').replace(/\D/g, '')

export const formatNip = (value) => {
  // O NIP do sistema deve aparecer no formato 19.0485.56.
  const digits = onlyDigits(value).slice(0, 8)
  const first = digits.slice(0, 2)
  const second = digits.slice(2, 6)
  const third = digits.slice(6, 8)

  if (digits.length <= 2) return first
  if (digits.length <= 6) return `${first}.${second}`
  return `${first}.${second}.${third}`
}

export const normalizeSector = (value) => String(value || '').toUpperCase()

export const formatContact = (value) => {
  // Formata telefone com DDD: (92) 99999-9999 ou (92) 9999-9999.
  const digits = onlyDigits(value).slice(0, 11)
  const ddd = digits.slice(0, 2)
  const number = digits.slice(2)

  if (!ddd) return ''
  if (digits.length <= 2) return `(${ddd}`
  if (number.length <= 4) return `(${ddd}) ${number}`
  if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5, 9)}`
}
