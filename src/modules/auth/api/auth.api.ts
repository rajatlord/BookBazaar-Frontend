import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, AuthTokenPayload } from '@/types/api.types'
import type { UserRole } from '@/types/enums'

interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Extract<UserRole, 'BUYER' | 'SELLER'>
}

interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiResponse<{ userId: string }>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    axiosClient.post<ApiResponse<AuthTokenPayload>>('/auth/login', payload),

  logout: () =>
    axiosClient.post<ApiResponse<null>>('/auth/logout'),
}