export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
}

export const JWT_KEY = 'bb_token'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOKS: '/books',
  BOOK_DETAIL: '/books/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  NOTIFICATIONS: '/notifications',
  SELLER: '/seller',
  SELLER_ADD_BOOK: '/seller/books/add',
  SELLER_ORDERS: '/seller/orders',
  ADMIN_BOOKS: '/admin/books',
  ADMIN_SHOPS: '/admin/shops',
  ADMIN_USERS: '/admin/users',
  FORBIDDEN: '/403',
} as const