import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  email: string
  name: string
  location?: string
  bio?: string
  availability?: TimeSlot[]
  is_public?: boolean
  skills?: Skill[]
  ratings?: Rating[]
  profile_photo_url?: string
}

export interface TimeSlot {
  day: string
  start: string
  end: string
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: string
  type: 'offer' | 'request'
  status: 'pending' | 'approved' | 'rejected'
}

export interface Swap {
  id: string
  requester: string
  receiver: string
  requester_skill_id: string
  receiver_skill_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  proposed_time_slots: TimeSlot[]
  actual_time?: string
}

export interface Rating {
  id: string
  swap_id: string
  rater_id: string
  rated_id: string
  rating: number
  comment: string
}

// Auth APIs
export const authAPI = {
  signup: (data: {
    email: string
    password: string
    name: string
    location?: string
    bio?: string
    availability?: TimeSlot[]
    is_public?: boolean
  }) => api.post('/api/user/signup/', data),

  verifyEmail: (data: { email: string; otp: string }) =>
    api.post('/api/user/verify-email/', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/user/login/', data),
}

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/user/profile/'),
  
  updateProfile: (data: {
    bio?: string
    location?: string
    is_public?: boolean
  }) => api.put('/api/user/profile/', data),

  getUser: (id: string) => api.get(`/api/user/${id}/`),

  uploadProfilePhoto: (file: File) => {
    const formData = new FormData()
    formData.append('profile_photo', file)
    return api.post('/api/user/profile-photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getProfilePhoto: (userId: string) =>
    api.get(`/api/user/profile-photo/${userId}/`),
}

// Skill APIs
export const skillAPI = {
  getAll: () => api.get('/api/skills/'),
  
  create: (data: {
    name: string
    description: string
    category: string
    level: string
    type: 'offer' | 'request'
  }) => api.post('/api/skills/', data),

  update: (id: string, data: { description?: string }) =>
    api.put(`/api/skills/${id}/`, data),

  delete: (id: string) => api.delete(`/api/skills/${id}/`),
}

// Swap APIs
export const swapAPI = {
  getAll: () => api.get('/api/swaps/'),
  
  create: (data: {
    requester_skill_id: string
    receiver_id: string
    receiver_skill_id: string
    proposed_time_slots: TimeSlot[]
  }) => api.post('/api/swaps/', data),

  accept: (id: string) => api.put(`/api/swaps/${id}/accept/`),
  
  reject: (id: string, data: { reason: string }) =>
    api.put(`/api/swaps/${id}/reject/`, data),

  complete: (id: string) => api.put(`/api/swaps/${id}/complete/`),
}

// Rating APIs
export const ratingAPI = {
  create: (data: {
    swap_id: string
    rater_id: string
    rated_id: string
    rating: number
    comment: string
  }) => api.post('/api/ratings/', data),
}

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/api/admin/users/'),
  
  banUser: (id: string, data: { is_banned: boolean }) =>
    api.put(`/api/admin/users/${id}/ban/`, data),

  getPendingSkills: () => api.get('/api/admin/skills/pending/'),
  
  approveSkill: (id: string) => api.put(`/api/admin/skills/${id}/approve/`),
  
  rejectSkill: (id: string, data: { reason: string }) =>
    api.put(`/api/admin/skills/${id}/reject/`, data),

  broadcastMessage: (data: { message: string }) =>
    api.post('/api/admin/messages/broadcast/', data),
}

export default api 