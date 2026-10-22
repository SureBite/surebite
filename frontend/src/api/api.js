import axios from 'axios'
import { mockApi } from './mockApi'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Globally configure Axios with withCredentials: true so cookies are automatically attached
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

const body = (response) => response.data

const realApi = {
  auth: {
    register: (data) => http.post('/auth/register', data).then(body),
    verifyOtp: (data) => http.post('/auth/verify-otp', data).then(body),
    resendOtp: (data) => http.post('/auth/resend-otp', data).then(body),
    login: (data) => http.post('/auth/login', data).then(body),
    logout: () => http.post('/auth/logout').then(body),
    getMe: () => http.get('/auth/me').then(body),
    forgotPassword: (data) => http.post('/auth/forgot-password', data).then(body),
    resetPassword: (token, data) => http.post(`/auth/reset-password/${token}`, data).then(body),
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
