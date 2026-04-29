import { http } from './http'

export async function getTopics() {
  const { data } = await http.get('/api/admin/topics')
  return data
}

export async function createTopic(payload) {
  const { data } = await http.post('/api/admin/topics', payload)
  return data
}

export async function updateTopic({ id, payload }) {
  const { data } = await http.put(`/api/admin/topics/${id}`, payload)
  return data
}

export async function deleteTopic(id) {
  const { data } = await http.delete(`/api/admin/topics/${id}`)
  return data
}
