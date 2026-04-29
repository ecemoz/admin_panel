import { http } from './http'

export async function getUsers() {
  const { data } = await http.get('/api/admin/users')
  return data
}

export async function deleteUser(id) {
  const { data } = await http.delete(`/api/admin/users/${id}`)
  return data
}

export async function updateUserRole({ id, payload }) {
  const { data } = await http.put(`/api/admin/users/${id}/role`, payload)
  return data
}
