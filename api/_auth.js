const COOKIE_NAME = 'admin_session'

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
}

function parseCookies(request) {
    const header = request.headers.cookie || ''

    return Object.fromEntries(
        header
            .split(';')
            .map((cookie) => cookie.trim().split('='))
            .filter(([key, value]) => key && value)
    )
}

export function isAdminAuthenticated(request) {
    const sessionSecret = getSessionSecret()
    if (!sessionSecret) return false

    const cookies = parseCookies(request)
    return cookies[COOKIE_NAME] === encodeURIComponent(sessionSecret)
}

export function requireAdmin(request, response) {
    if (isAdminAuthenticated(request)) return false

    response.status(401).json({
        error: 'Acesso administrativo nao autorizado.',
    })
    return true
}

export function setAdminCookie(response) {
    const secureFlag = process.env.VERCEL ? '; Secure' : ''
    const sessionSecret = getSessionSecret()

    if (!sessionSecret) {
        throw new Error('ADMIN_SESSION_SECRET ou ADMIN_PASSWORD precisa estar configurada.')
    }

    // Cookie HttpOnly: o JavaScript do navegador nao consegue ler o valor da sessao.
    response.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=${encodeURIComponent(sessionSecret)}; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=28800`
    )
}

export function clearAdminCookie(response) {
    const secureFlag = process.env.VERCEL ? '; Secure' : ''

    response.setHeader(
        'Set-Cookie',
        `${COOKIE_NAME}=; HttpOnly${secureFlag}; SameSite=Lax; Path=/; Max-Age=0`
    )
}
