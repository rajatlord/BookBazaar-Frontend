// ═══════════════════════════════════════════════════════════
// FILE: src/hooks/useDebounce.ts  (Part 9)
//
// TEACH — Custom hooks:
// A custom hook is a function that starts with `use` and can
// call other hooks inside it. It lets you extract stateful
// logic out of components into reusable functions.
//
// useDebounce wraps useState + useEffect into one call:
//   const q = useDebounce(searchInput, 400)
// vs doing this manually in every component that needs it.
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
