import { useState } from 'react'
// ═══════════════════════════════════════════════════════════
// FILE: src/hooks/usePagination.ts  (Part 9)
//
// TEACH — Extracting repeated patterns into hooks:
// Every list page (BooksPage, OrdersPage, AdminBooksPage) needs
// page + limit state and a reset function. Rather than copying
// 3 useState calls into every page, we extract the pattern once.
// ═══════════════════════════════════════════════════════════

export function usePagination(initialLimit = 12) {
  const [page, setPage] = useState(1)
  const [limit]         = useState(initialLimit)
  const reset           = () => setPage(1)
  return { page, limit, setPage, reset }
}

