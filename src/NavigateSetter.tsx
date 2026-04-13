// ═══════════════════════════════════════════════════════════
// FILE: src/NavigateSetter.tsx  (Part 9)
//
// TEACH — Programmatic navigation outside React components:
// useNavigate() only works inside React components. But
// axiosClient interceptors are plain JS functions — no hooks.
// Solution: store the navigate function in a module-level
// variable, set it from a component that mounts once.
// This is the same pattern your company_code uses.
//
// Usage outside components:
//   import { getNavigate } from 'src/NavigateSetter'
//   getNavigate()?.('/login')
// ═══════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { useNavigate, NavigateFunction } from 'react-router-dom'

let _navigate: NavigateFunction | null = null

export function getNavigate(): NavigateFunction | null {
  return _navigate
}

export function NavigateSetter() {
  const navigate = useNavigate()
  useEffect(() => {
    _navigate = navigate
    return () => { _navigate = null }
  }, [navigate])
  return null    // renders nothing — pure side effect
}

