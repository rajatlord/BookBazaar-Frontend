// ─────────────────────────────────────────────────────────────
// security/index.tsx
//
// TEACH — Route guards in React Router v6:
// v6 doesn't have a built-in PrivateRoute. You build your own
// by returning a <Navigate> when the condition fails.
//
// <Navigate> is a component that triggers navigation as a
// side-effect of rendering. When React renders <Navigate to="/login">,
// the router immediately changes the URL. No useEffect needed.
//
// TEACH — The `replace` prop on <Navigate>:
// Without replace:  /orders → /login → back button → /orders (loops!)
// With replace:     /orders → /login → back button → wherever before /orders
// Always use replace when redirecting due to auth failure.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { ROUTES } from '@/config/constants'
import type { UserRole } from '../types/enums'
// ── ProtectedRoute: checks authentication ─────────────────
interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // TEACH: state={{ from: location }} passes the current URL
    // to the login page so after login we can redirect back.
    // LoginPage can read: const from = location.state?.from?.pathname
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <>{children}</>
}


interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />
  }

  return <>{children}</>
}