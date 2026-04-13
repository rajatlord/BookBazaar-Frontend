// ─────────────────────────────────────────────────────────────
// axiosClient.ts
//
// TEACH: This is a singleton — one axios instance shared by the
// entire app. Two interceptors do the heavy lifting:
//   1. Request interceptor  → attaches JWT to every outgoing call
//   2. Response interceptor → catches 401 globally, forces logout
//
// Why not just pass the token manually each time?
// Because that's 40+ api calls all needing the same boilerplate.
// Interceptors = one place, zero repetition.
// ─────────────────────────────────────────────────────────────

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/config/constants'
import { useAuthStore } from '@/modules/auth/store/authStore'
// TEACH: We use a getter function instead of importing the store
// directly at the top of this file. Why? Circular dependency.
// axiosClient ← authStore imports axiosClient
// If we import authStore here at the top → circular import crash.
// The getter is called lazily (only when a request fires), so by
// that time all modules are fully loaded.
const getToken = () => useAuthStore.getState().token

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ── Interceptor 1: attach token ──────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  }
)

// ── Interceptor 2: handle 401 globally ──────────────────────
axiosClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Utility: extract readable error message ──────────────────
// TEACH: Every API call can fail in different ways:
//   - Network down       → no response at all
//   - Server error       → response with { message: "..." }
//   - Unexpected crash   → unknown shape
// This function handles all 3 and always returns a string.
export function extractApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { message?: string } } }
    return e.response?.data?.message ?? 'Something went wrong'
  }
  return 'Something went wrong'
}