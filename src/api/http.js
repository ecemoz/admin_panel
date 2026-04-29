import axios from 'axios'
import { clearAuthStorage, getToken } from '../lib/storage'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthStorage()
      window.dispatchEvent(new CustomEvent('admin:unauthorized'))
      if (window.location.pathname !== '/admin/login') {
        window.location.assign('/admin/login')
      }
    }

    return Promise.reject(error)
  },
)
