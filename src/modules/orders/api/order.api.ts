import { axiosClient } from '../../../api/axiosClient'
import type { ApiResponse, Order, PaginatedResult } from '../../../types/api.types'
import type { OrderStatus } from '../../../types/enums'

interface PlaceOrderPayload {
  addressId: string
  paymentMethod: string
}

export const orderApi = {
  place: (payload: PlaceOrderPayload) =>
    axiosClient.post<ApiResponse<Order>>('/orders', payload),

  getAll: (params?: { page?: number; limit?: number }) =>
    axiosClient.get<ApiResponse<PaginatedResult<Order>>>('/orders', { params }),

  getById: (orderId: string) =>
    axiosClient.get<ApiResponse<Order>>(`/orders/${orderId}`),

  updateStatus: (orderId: string, status: OrderStatus) =>
    axiosClient.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status }),
}