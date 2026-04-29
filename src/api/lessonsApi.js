import { http } from './http'

export async function getLessons() {
  const { data } = await http.get('/api/admin/lessons')
  return data
}

export async function createLesson(payload) {
  const { data } = await http.post('/api/admin/lessons', payload)
  return data
}

export async function updateLesson({ id, payload }) {
  const { data } = await http.put(`/api/admin/lessons/${id}`, payload)
  return data
}

export async function deleteLesson(id) {
  const { data } = await http.delete(`/api/admin/lessons/${id}`)
  return data
}
