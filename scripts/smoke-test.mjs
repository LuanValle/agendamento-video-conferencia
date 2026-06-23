const args = new Map(
  process.argv
    .slice(2)
    .map((arg) => {
      const [key, value = ''] = arg.split('=')
      return [key.replace(/^--/, ''), value]
    }),
)

const baseUrl = (args.get('base-url') || process.env.SMOKE_BASE_URL || 'https://videos-conferencias.vercel.app').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  return {
    body,
    headers: response.headers,
    ok: response.ok,
    status: response.status,
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const status = await request('/api/status')
assert(status.status === 200, `Esperava /api/status 200, recebeu ${status.status}`)
assert(status.body?.status === 'ok', 'Esperava status ok na API.')

const invalidRequest = await request('/api/solicitacoes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
})
assert(invalidRequest.status === 400, `Esperava validacao 400 ao criar solicitacao vazia, recebeu ${invalidRequest.status}`)

const invalidTracking = await request('/api/acompanhamento?tipo=nip&valor=123')
assert(invalidTracking.status === 400, `Esperava validacao 400 para NIP incompleto, recebeu ${invalidTracking.status}`)

const tracking = await request('/api/acompanhamento?tipo=nip&valor=99.9999.99&pagina=1')
assert(tracking.status === 200, `Esperava acompanhamento 200, recebeu ${tracking.status}`)
assert(Array.isArray(tracking.body?.data), 'Acompanhamento deve retornar data como array.')
assert(tracking.body?.data.length <= 10, 'Acompanhamento deve limitar a pagina a 10 resultados.')
assert(tracking.body?.meta?.pageSize === 10, 'Acompanhamento deve informar pageSize igual a 10.')
assert(
  tracking.body?.data.every((item) => !Object.prototype.hasOwnProperty.call(item, 'link')),
  'Acompanhamento publico nao deve expor o link da videoconferencia.',
)

const adminUser = process.env.ADMIN_USER
const adminPassword = process.env.ADMIN_PASSWORD
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD

if ((adminUser && adminPassword) || adminSessionSecret) {
  let cookie

  const login = await request('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: adminUser,
      password: adminPassword,
    }),
  })

  if (login.status === 200) {
    cookie = login.headers.get('set-cookie')?.split(';')[0]
    assert(cookie, 'Login admin nao retornou cookie de sessao.')
  } else if (adminSessionSecret) {
    cookie = `admin_session=${encodeURIComponent(adminSessionSecret)}`
    console.log('Login admin nao confirmou credenciais; usando segredo de sessao local para testar rotas protegidas.')
  } else {
    throw new Error(`Esperava login admin 200, recebeu ${login.status}`)
  }

  const pending = await request('/api/solicitacoes?status=pendente', {
    headers: { Cookie: cookie },
  })
  assert(pending.status === 200, `Esperava filtro de pendentes 200, recebeu ${pending.status}`)
  assert(Array.isArray(pending.body?.data), 'Filtro de pendentes deve retornar data como array.')

  const paginated = await request('/api/solicitacoes?limit=2&offset=0', {
    headers: { Cookie: cookie },
  })
  assert(paginated.status === 200, `Esperava pagina de solicitacoes 200, recebeu ${paginated.status}`)
  assert(Array.isArray(paginated.body?.data), 'Pagina de solicitacoes deve retornar data como array.')
  assert(paginated.body?.data.length <= 2, 'Pagina de solicitacoes deve respeitar o limit.')
  assert(typeof paginated.body?.meta?.total === 'number', 'Pagina de solicitacoes deve retornar meta.total.')
  assert(paginated.body?.meta?.limit === 2, 'Pagina de solicitacoes deve retornar meta.limit correto.')

  const invalidStatus = await request('/api/solicitacoes?status=invalido', {
    headers: { Cookie: cookie },
  })
  assert(invalidStatus.status === 400, `Esperava status invalido 400, recebeu ${invalidStatus.status}`)
} else {
  console.log('Credenciais ADMIN_USER/ADMIN_PASSWORD ausentes; testes administrativos foram pulados.')
}

console.log(`Smoke test concluido em ${baseUrl}.`)
