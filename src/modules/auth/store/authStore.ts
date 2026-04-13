// ─────────────────────────────────────────────────────────────
// authStore.ts
//
// TEACH: Zustand is the simplest state manager for React.
// Compare it to Redux:
//
//   Redux:  action → reducer → selector → connect → component
//   Zustand: useAuthStore().user  ← done.
//
// The create() call returns a hook. The hook gives you the
// current state AND the actions. No Provider needed (unlike
// Redux or Context). The store lives outside React's tree.
//
// Key Zustand rule: put ONLY global, cross-component state here.
// Local state (a form's loading spinner) stays in useState().
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { User } from '@/types/api.types'

interface AuthState {
  // ── State ──────────────────────────────────────────────────
  user:            User | null
  token:           string | null
  isAuthenticated: boolean

  // ── Actions ────────────────────────────────────────────────
  // TEACH: Actions live inside the store itself — not in a
  // separate slice/reducer. This keeps everything co-located.
  setAuth:  (user: User, token: string) => void
  logout:   () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state — nobody logged in
  user:            null,
  token:           null,
  isAuthenticated: false,

  // Called after successful login or register
  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  // Called on logout button OR when 401 fires in axiosClient
  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}))

// ─────────────────────────────────────────────────────────────
// TEACH: Selectors — avoid re-renders by selecting only what
// you need. Zustand re-renders a component ONLY when the
// selected slice changes.
//
// Usage in a component:
//   const user = useAuthStore(s => s.user)        ← only re-renders when user changes
//   const { user, token } = useAuthStore()        ← re-renders on ANY store change
//
// For this app the store is small so full destructure is fine.
// In large stores with 20+ fields, always use selectors.
// ─────────────────────────────────────────────────────────────