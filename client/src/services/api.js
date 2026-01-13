import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    throw error
  }
)

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyToken: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout')
}

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, studentData) => api.put(`/students/${id}`, studentData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/students/${id}`),
  generateQR: (id) => api.get(`/students/${id}/qr`)
}

export const scannerService = {
  verifyQR: (qrData, location) => api.post('/scan/verify', { qrData, location }),
  manualVerify: (studentId, location, reason) => 
    api.post('/scan/manual-verify', { student_id: studentId, location, reason }),
  getLogs: (params) => api.get('/scan/logs', { params })
}

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getHealth: () => api.get('/dashboard/health')
}

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats/summary')
}

export default api
