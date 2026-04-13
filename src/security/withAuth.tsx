// HOC version — use when you need to wrap a component instead of a route
import React from 'react'
import { useAuthStore } from '../modules/auth/store/authStore'
import type { UserRole } from '../types/enums'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../config/constants'

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) {
      return <Navigate to={ROUTES.LOGIN} replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />
    }

    return <Component {...props} />
  }
}