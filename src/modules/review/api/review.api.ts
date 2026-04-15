import { axiosClient } from "@/api/axiosClient";
import type { ApiResponse, Review, PaginatedResult } from "@/types/api.types";

export const reviewApi = {
  getByBook: (bookId: string, params?: { page?: number; limit?: number }) =>
    axiosClient.get<
      ApiResponse<{
        reviews: Review[];
        averageRating: number;
        totalReviews: number;
      }>
    >(`/books/${bookId}/reviews`, { params }),
  submit: (
    bookId: string,
    payload: { orderId: string; rating: number; comment?: string },
  ) =>
    axiosClient.post<ApiResponse<Review>>(`/books/${bookId}/reviews`, payload),
};
