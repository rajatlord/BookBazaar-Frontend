import type { UserRole } from '../types/enums'
import { ROUTES } from './constants'

export const ROLE_HOME: Record<UserRole, string> = {
  BUYER: ROUTES.BOOKS,
  SELLER: ROUTES.SELLER,
  ADMIN: ROUTES.ADMIN_BOOKS,
}

export const PROTECTED_ROLES: Record<string, UserRole[]> = {
  [ROUTES.CART]: ['BUYER'],
  [ROUTES.CHECKOUT]: ['BUYER'],
  [ROUTES.ORDERS]: ['BUYER'],
  [ROUTES.NOTIFICATIONS]: ['BUYER', 'SELLER', 'ADMIN'],
  [ROUTES.SELLER]: ['SELLER'],
  [ROUTES.SELLER_ADD_BOOK]: ['SELLER'],
  [ROUTES.SELLER_ORDERS]: ['SELLER'],
  [ROUTES.ADMIN_BOOKS]: ['ADMIN'],
  [ROUTES.ADMIN_SHOPS]: ['ADMIN'],
  [ROUTES.ADMIN_USERS]: ['ADMIN'],
}