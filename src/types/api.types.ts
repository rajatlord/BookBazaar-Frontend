import type {
  UserRole,
  BookStatus,
  OrderStatus,
  PaymentMethod,
  ShopStatus,
  NotificationType,
} from './enums'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  isVerified: boolean
  isSuspended?: boolean
  createdAt: string
}

export interface AuthTokenPayload {
  userId: string
  name: string
  role: UserRole
  token: string
}

export interface AuthUser {
  id: string
  name: string
  role: UserRole
}

export interface Shop {
  shopId: string
  sellerId: string
  name: string
  description?: string
  status: ShopStatus
  createdAt: string
}

export interface PendingShop {
  shopId: string
  name: string
  sellerName: string
  sellerEmail: string
  submittedAt: string
  status: ShopStatus
}

export interface Book {
  id: string
  shopId: string
  title: string
  author: string
  isbn: string
  price: number
  genre?: string
  description?: string
  status: BookStatus
  stockCount: number
  createdAt: string
  shop?: Shop
}

export interface PendingBook {
  id: string;
  shopId: string;
  title: string;
  author: string;
  bookId:string;
  sellerName:string;
  shopName:string;
  status: BookStatus;
  submittedAt: string;
  price: number;
  genre?: string;
  isbn: string;
  availableStock: number;
}
export interface Inventory {
  id: string
  bookId: string
  shopId: string
  stockCount: number
  reservedCount: number
}

export interface CartItem {
  id: string
  cartId: string
  bookId: string
  bookTitle: string
  quantity: number
  priceAtAddTime: number
  subtotal: number
  book: Book
}

export interface Cart {
  id: string
  buyerId: string
  totalAmount: number
  expiresAt: string
  items: CartItem[]
}

export interface Address {
  id: string
  buyerId: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface OrderItem {
  id: string
  orderId: string
  bookId: string
  quantity: number
  priceAtPurchase: number
  bookTitleSnapshot: string
}

export interface Payment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  transactionId?: string
}

export interface Order {
  id: string
  buyerId: string
  totalAmount: number
  status: OrderStatus
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingPincode: string
  placedAt: string
  items: OrderItem[]
  payment?: Payment
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  channel: string
  isRead: boolean
  referenceId?: string
  message?: string
  createdAt: string
}

export interface Review {
  id: string
  bookId: string
  buyerId: string
  orderId: string
  rating: number
  comment?: string
  isVerifiedPurchase: boolean
  createdAt: string
  buyer?: Pick<User, 'id' | 'name'>
}