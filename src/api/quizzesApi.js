import { http } from './http'

export async function getQuizzes() {
  const { data } = await http.get('/api/admin/quizzes')
  return data
}

export async function getQuizById(id) {
  const { data } = await http.get(`/api/admin/quizzes/${id}`)
  return data
}

export async function createQuiz(payload) {
  const { data } = await http.post('/api/admin/quizzes', payload)
  return data
}

export async function updateQuiz({ id, payload }) {
  const { data } = await http.put(`/api/admin/quizzes/${id}`, payload)
  return data
}

export async function deleteQuiz(id) {
  const { data } = await http.delete(`/api/admin/quizzes/${id}`)
  return data
}

export async function createQuestion({ quizId, payload }) {
  const { data } = await http.post(`/api/admin/quizzes/${quizId}/questions`, payload)
  return data
}

export async function updateQuestion({ questionId, payload }) {
  const { data } = await http.put(`/api/admin/questions/${questionId}`, payload)
  return data
}

export async function deleteQuestion(questionId) {
  const { data } = await http.delete(`/api/admin/questions/${questionId}`)
  return data
}

export async function createOption({ questionId, payload }) {
  const { data } = await http.post(`/api/admin/questions/${questionId}/options`, payload)
  return data
}

export async function updateOption({ optionId, payload }) {
  const { data } = await http.put(`/api/admin/options/${optionId}`, payload)
  return data
}

export async function deleteOption(optionId) {
  const { data } = await http.delete(`/api/admin/options/${optionId}`)
  return data
}
