import axios from "axios"

// Use localhost for development, fallback to deployed URL
// Check if we're in development (localhost) and use port 8080, otherwise use env or default
const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalDev ? "http://localhost:8080" : "https://mindease-node-server.onrender.com")

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (data) => api.post("/api/auth/signup", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
}

// User API
export const userAPI = {
  getProfile: () => api.get("/api/user/profile"),
  updateProfile: (data) => api.put("/api/user/profile", data),
  deleteProfile: () => api.delete("/api/user/profile"),
}

// Mood API
export const moodAPI = {
  addLog: (data) => api.post("/api/mood/log", data),
  getHistory: (params) => api.get("/api/mood/history", { params }),
  getAnalytics: (period = "week") => api.get(`/api/mood/analytics?period=${period}`),
}

// Recommendation API
export const recommendationAPI = {
  getGeneral: () => api.get("/api/recommendations/general"),
  getPersonalized: () => api.get("/api/recommendations/personalized"),
  updateStatus: (id, status) => api.patch(`/api/recommendations/${id}/status`, { status }),
}

// Chat API
export const chatAPI = {
  sendQuery: (message) => api.post("/api/chat/query", { message }),
  getHistory: (limit = 50) => api.get(`/api/chat/history?limit=${limit}`),
}

// Resource API
export const resourceAPI = {
  getAll: (params) => api.get("/api/resources/all", { params }),
  getByCategory: (category) => api.get(`/api/resources/${category}`),
}

export default api
