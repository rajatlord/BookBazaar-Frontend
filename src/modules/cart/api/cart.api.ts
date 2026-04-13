import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, Cart } from '@/types/api.types'

export const cartApi = {
  getCart: () =>
    axiosClient.get<ApiResponse<Cart>>('/cart'),
  addItem: (bookId: string, quantity: number) =>
    axiosClient.post<ApiResponse<Cart>>('/cart/items', { bookId, quantity }),
  removeItem: (itemId: string) =>
    axiosClient.delete<ApiResponse<null>>(`/cart/items/${itemId}`),
}