import { axiosClient } from '../../../api/axiosClient'
import type { ApiResponse, Notification, PaginatedResult } from '../../../types/api.types'

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Notification>>>(
      '/notifications', { params }
    ),

  markRead: (id: string) =>
    axiosClient.patch<ApiResponse<null>>(`/notifications/${id}/read`),
}