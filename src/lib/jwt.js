export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function extractRolesFromPayload(payload) {
  if (!payload) return []

  const candidates = [payload.role, payload.roles, payload.authorities]
  return candidates
    .flatMap((value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      return [value]
    })
    .map((role) => String(role).toUpperCase())
}

export function isAdminFromToken(token) {
  const payload = parseJwt(token)
  const roles = extractRolesFromPayload(payload)
  return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')
}

export function userFromToken(token) {
  const payload = parseJwt(token)
  if (!payload) return null

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    roles: payload.roles,
  }
}
