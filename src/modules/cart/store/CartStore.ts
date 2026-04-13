// ─────────────────────────────────────────────────────────────
// cartStore.ts  (Part 5)
//
// TEACH — Async actions in Zustand:
// Unlike Redux (where async logic lives in thunks/sagas),
// Zustand actions can be async directly. Just mark them async
// and call set() when the data arrives. Zustand doesn't care.
//
// TEACH — get() inside a store:
// The second argument to create() is `get` — it returns the
// CURRENT state at call time. Use it when an action needs to
// read other state values (e.g. fetchCart needs nothing, but
// removeItem needs to call fetchCart which is also in this store).
//
// TEACH — Derived state (itemCount):
// We store itemCount separately instead of computing it from
// cart?.items?.length on every render. This is a micro-optimization
// but more importantly it shows the pattern: store only the
// minimal state, derive the rest — but for very cheap derivations,
// just compute inline in the component.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { Cart } from '@/types/api.types'
import { cartApi } from '../api/cart.api'

interface CartState {
  cart:      Cart | null
  itemCount: number
  loading:   boolean

  fetchCart:      () => Promise<void>
  addItem:        (bookId: string, quantity: number) => Promise<void>
  removeItem:     (itemId: string) => Promise<void>
  clearLocalCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart:      null,
  itemCount: 0,
  loading:   false,

  fetchCart: async () => {
    set({ loading: true })
    try {
      const res  = await cartApi.getCart()
      const cart = res.data.data
      set({ cart, itemCount: cart.items.length })
    } catch {
      // Cart might not exist yet (new user) — that's fine
      set({ cart: null, itemCount: 0 })
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (bookId, quantity) => {
    const res  = await cartApi.addItem(bookId, quantity)
    const cart = res.data.data
    set({ cart, itemCount: cart.items.length })
  },

  removeItem: async (itemId) => {
    await cartApi.removeItem(itemId)
    // TEACH: get() reads the store's fetchCart action.
    // We call it to refresh the full cart state after removal.
    await get().fetchCart()
  },

  // Called after successful checkout — reset without API call
  clearLocalCart: () => set({ cart: null, itemCount: 0 }),
}))