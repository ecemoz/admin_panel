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

  // Standard claim names
  let candidates = [payload.role, payload.roles, payload.authorities]

  // .NET namespace-prefixed claim names
  const dotNetRoleClaim = Object.keys(payload).find((key) =>
    key.includes('claims/role') || key.includes('claims/roles'),
  )
  if (dotNetRoleClaim && payload[dotNetRoleClaim]) {
    candidates.push(payload[dotNetRoleClaim])
  }

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

  // Standard claims
  let id = payload.sub
  let email = payload.email
  let name = payload.name
  let role = payload.role

  // .NET namespace-prefixed claim names
  const nameIdClaim = Object.keys(payload).find((key) => key.includes('nameidentifier'))
  const emailClaim = Object.keys(payload).find((key) => key.includes('emailaddress'))
  const nameClaim = Object.keys(payload).find((key) => key.includes('/name') && !key.includes('identifier'))
  const roleClaim = Object.keys(payload).find((key) => key.includes('claims/role'))

  if (nameIdClaim) id = payload[nameIdClaim]
  if (emailClaim) email = payload[emailClaim]
  if (nameClaim) name = payload[nameClaim]
  if (roleClaim) role = payload[roleClaim]

  return {
    id,
    email,
    name,
    role,
    roles: payload.roles,
  }
}
