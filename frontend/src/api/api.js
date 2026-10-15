import axios from 'axios'
import { TOKEN_KEY } from '../utils/constants'
import { mockApi } from './mockApi'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const http = axios.create({ baseURL: API_URL })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const body = (response) => response.data

const realApi = {
  auth: {
    register: (data) => http.post('/auth/register', data).then(body),
    login: (data) => http.post('/auth/login', data).then(body),
    getMe: () => http.get('/auth/me').then(body),
  },
  menus: {
    getAll: () => http.get('/menus').then(body),
    upload: (formData) => http.post('/menus/upload', formData).then(body),
    getById: (id) => http.get(`/menus/${id}`).then(body),
    update: (id, data) => http.put(`/menus/${id}`, data).then(body),
    publish: (id) => http.patch(`/menus/${id}/publish`).then(body),
    getQr: (id) => http.get(`/menus/${id}/qr`).then(body),
    delete: (id) => http.delete(`/menus/${id}`).then(body),
  },
  diner: {
    getMenu: (slug) => http.get(`/diner/${slug}`).then(body),
    logScan: (slug, data) => http.post(`/diner/${slug}/scan`, data).then(body),
  },
}

export const api = USE_MOCK ? mockApi : realApi

export function getErrorMessage(error) {
  const data = error?.response?.data
  if (data && typeof data.message === 'string') return data.message
  if (data && typeof data.error === 'string') return data.error
  if (error?.request && !error.response) return 'We couldn’t reach the server. Check your connection and try again.'
  return error?.message || 'Something went wrong. Please try again.'
}

export default api
