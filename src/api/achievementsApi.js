import { http } from './http'

export async function getAchievements() {
  const { data } = await http.get('/api/admin/achievements')
  return data
}

export async function createAchievement(payload) {
  const { data } = await http.post('/api/admin/achievements', payload)
  return data
}

export async function updateAchievement({ id, payload }) {
  const { data } = await http.put(`/api/admin/achievements/${id}`, payload)
  return data
}

export async function deleteAchievement(id) {
  const { data } = await http.delete(`/api/admin/achievements/${id}`)
  return data
}
