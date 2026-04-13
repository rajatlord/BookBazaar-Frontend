import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, PaginatedResult, Book } from '@/types/api.types'

interface BookSearchParams {
  search?: string
  genre?: string
  page?: number
  limit?: number
}

export const bookApi = {
  search: (params: BookSearchParams) =>
    axiosClient.get<ApiResponse<PaginatedResult<Book>>>('/books', { params }),

  getById: (id: string) =>
    axiosClient.get<ApiResponse<Book>>(`/books/${id}`),

  create: (payload: Omit<Book, 'id' | 'shopId' | 'status' | 'createdAt' | 'shop'>) =>
    axiosClient.post<ApiResponse<Book>>('/books', payload),

  update: (id: string, payload: Partial<Book>) =>
    axiosClient.put<ApiResponse<Book>>(`/books/${id}`, payload),

  updateStock: (bookId: string, stockCount: number) =>
    axiosClient.patch<ApiResponse<{ stockCount: number }>>(
      `/books/inventory/${bookId}/stock`, { stockCount }
    ),
}