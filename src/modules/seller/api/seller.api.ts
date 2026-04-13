// ─────────────────────────────────────────────────────────────
// seller.api.ts  (Part 7)
//
// TEACH — API module naming convention:
// We keep shop + book operations that a SELLER performs in one
// file. Why? The seller module owns this concern. bookApi.ts
// is for PUBLIC book browsing. seller.api.ts is for seller
// mutations — create, update stock, manage shop.
// Same endpoint, different intent → different module.
// ─────────────────────────────────────────────────────────────

import { axiosClient } from '@/api/axiosClient'
import type { ApiResponse, PaginatedResult, Shop, Book, Order } from '@/types/api.types'
import type { OrderStatus } from '@/types/enums'

interface CreateShopPayload {
  name:        string
  description?: string
}

interface CreateBookPayload {
  title:        string
  author:       string
  isbn:         string
  price:        number
  stockCount:   number
  genre?:       string
  description?: string
}

export const sellerApi = {
  // ── Shop ──────────────────────────────────────────────────
  createShop: (payload: CreateShopPayload) =>
    axiosClient.post<ApiResponse<Shop>>('/seller/shop', payload),

  getMyShop: () =>
    axiosClient.get<ApiResponse<Shop>>('/seller/shop/my'),

  // ── Books ─────────────────────────────────────────────────
  createBook: (payload: CreateBookPayload) =>
    axiosClient.post<ApiResponse<Book>>('/books', payload),

  updateBook: (id: string, payload: Partial<CreateBookPayload>) =>
    axiosClient.put<ApiResponse<Book>>(`/books/${id}`, payload),

  updateStock: (bookId: string, stockCount: number) =>
    axiosClient.patch<ApiResponse<{ stockCount: number }>>(
      `/books/inventory/${bookId}/stock`, { stockCount }
    ),

  getMyBooks: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Book>>>('/books', {
      params: { ...params, shopId: 'mine' },
    }),

  // ── Orders ────────────────────────────────────────────────
  // TEACH: Sellers don't have a dedicated "my orders" endpoint
  // in this backend — they update order status on existing orders.
  // The seller sees orders that contain their books.
  getOrders: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Order>>>('/orders', { params }),

  shipOrder: (orderId: string) =>
    axiosClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, {
      status: 'SHIPPED' as OrderStatus,
    }),

  updateOrderStatus: (orderId: string, status: OrderStatus) =>
    axiosClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status }),
}