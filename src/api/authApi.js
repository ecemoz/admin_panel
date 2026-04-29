import { http } from './http'

const LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/api/auth/login'

export async function loginAdmin(payload) {
  const { data } = await http.post(LOGIN_ENDPOINT, payload)
  return data
}
