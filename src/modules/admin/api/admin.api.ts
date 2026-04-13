import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, Book, Shop, PaginatedResult, User } from '@/types/api.types'

type VerifyAction = 'APPROVE' | 'REJECT'

export const adminApi = {
  getPendingBooks: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Book>>>(
      '/admin/books/pending', { params }
    ),
  verifyBook: (id: string, action: VerifyAction, reason?: string) =>
    axiosClient.patch<ApiResponse<Book>>(`/admin/books/${id}/verify`, { action, reason }),

  getPendingShops: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Shop>>>(
      '/admin/shops/pending', { params }
    ),
  verifyShop: (id: string, action: VerifyAction, reason?: string) =>
    axiosClient.patch<ApiResponse<Shop>>(`/admin/shops/${id}/verify`, { action, reason }),

  getUsers: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<User>>>('/admin/users', { params }),

  suspendUser: (userId: string) =>
    axiosClient.patch<ApiResponse<null>>(`/admin/users/${userId}/suspend`),
}