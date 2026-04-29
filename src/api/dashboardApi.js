import { http } from './http'

export async function getDashboardSummary() {
  const { data } = await http.get('/api/admin/dashboard/summary')
  return data
}
