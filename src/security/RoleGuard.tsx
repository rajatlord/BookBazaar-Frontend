import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../modules/auth/store/authStore'
import type { UserRole } from '../types/enums'
import { ROUTES } from '../config/constants'

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