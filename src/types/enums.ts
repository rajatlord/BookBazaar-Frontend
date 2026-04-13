export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN'

export type BookStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'UNLISTED'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET'

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'BOOK_VERIFIED'
  | 'BOOK_REJECTED'
  | 'SHOP_VERIFIED'
  | 'SHOP_REJECTED'