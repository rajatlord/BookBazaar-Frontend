// ─────────────────────────────────────────────────────────────
// notifierStore.ts  (Part 6)
//
// TEACH — Multiple Zustand stores:
// You can have as many stores as you want. Each is independent.
// Components only re-render when their subscribed store changes.
// authStore changes don't cause notifierStore subscribers to
// re-render — total isolation.
//
// Common pattern: one store per domain, just like your modules.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Notification } from '@/types/api.types'
import { notificationApi } from '../api/notification.api'

interface NotifierState {
  notifications: Notification[]
  unreadCount:   number
  loading:       boolean
  fetchAll:      () => Promise<void>
  markRead:      (id: string) => Promise<void>
  markAllRead:   () => void
}

export const useNotifierStore = create<NotifierState>((set) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,

  fetchAll: async () => {
    set({ loading: true })
    try {
      const res   = await notificationApi.getAll()
      const items = res.data.data.data
      set({
        notifications: items,
        unreadCount:   items.filter((n) => !n.isRead).length,
      })
    } catch { /* user might not be logged in yet */ }
    finally { set({ loading: false }) }
  },

  markRead: async (id: string) => {
    await notificationApi.markRead(id)
    // TEACH: Optimistic update — update local state immediately,
    // don't wait for a refetch. This makes the UI feel instant.
    // If the API call fails, the UI is slightly wrong — acceptable
    // for a notification read state. For money/orders, always refetch.
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },
}))