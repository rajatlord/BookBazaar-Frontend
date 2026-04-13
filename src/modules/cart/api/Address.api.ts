import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, Address } from '@/types/api.types'

export const addressApi = {
  getAll: () =>
    axiosClient.get<ApiResponse<Address[]>>('/users/addresses'),
  create: (payload: Omit<Address, 'id' | 'buyerId'>) =>
    axiosClient.post<ApiResponse<Address>>('/users/addresses', payload),
}