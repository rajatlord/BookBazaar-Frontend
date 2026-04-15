import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../modules/auth/store/authStore'
import { ROUTES } from "../config/constants"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}