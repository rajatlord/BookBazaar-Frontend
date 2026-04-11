# BookBazaar Frontend — Complete Plan

## Tech Stack (Final)

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Fast dev, strict types |
| UI Library | Ant Design 5 | company_code pattern, mature components |
| Styling | AntD ConfigProvider tokens + CSS Modules | No Tailwind, follows your codebase |
| State | Zustand | Lightweight, no boilerplate |
| Routing | React Router v6 | CSR, JWT-based auth |
| HTTP | Axios | Interceptors for JWT + error handling |
| Rendering | CSR (Client-Side Rendering) | All data is user-specific, nothing to pre-render |

### Why NOT SSR/SSG?
SSR (Next.js) and SSG are for public, indexable content — blogs, landing pages, marketing.
BookBazaar is a **web app**: all pages require authentication, data is per-user (cart, orders, inventory).
CSR + React Router is the correct industry-standard choice. Swiggy, Zepto, Meesho seller dashboards all use CSR.

---

## Folder Structure

```
src/
├── config/
│   ├── constants.ts              # BASE_URL, pagination limits, app constants
│   └── permissions.ts            # Role → allowed routes map
│
├── hooks/
│   ├── useDebounce.ts            # Search input debouncing
│   ├── usePagination.ts          # Page/limit state
│   └── useMediaQuery.ts          # Responsive breakpoints
│
├── i18n/                         # Future — translation strings
│
├── modules/
│   ├── auth/
│   │   ├── api/auth.api.ts
│   │   ├── components/LoginForm.tsx
│   │   ├── components/RegisterForm.tsx
│   │   ├── pages/LoginPage.tsx
│   │   ├── pages/RegisterPage.tsx
│   │   ├── store/authStore.ts
│   │   └── types/auth.types.ts
│   │
│   ├── books/
│   │   ├── api/book.api.ts
│   │   ├── components/BookCard.tsx
│   │   ├── components/BookGrid.tsx
│   │   ├── components/BookFilters.tsx
│   │   ├── pages/BooksPage.tsx
│   │   ├── pages/BookDetailPage.tsx
│   │   └── types/book.types.ts
│   │
│   ├── cart/
│   │   ├── api/cart.api.ts
│   │   ├── components/CartDrawer.tsx
│   │   ├── components/CartItem.tsx
│   │   ├── pages/CartPage.tsx
│   │   ├── store/cartStore.ts
│   │   └── types/cart.types.ts
│   │
│   ├── orders/
│   │   ├── api/order.api.ts
│   │   ├── components/OrderCard.tsx
│   │   ├── components/CheckoutForm.tsx
│   │   ├── pages/OrdersPage.tsx
│   │   ├── pages/OrderDetailPage.tsx
│   │   ├── pages/CheckoutPage.tsx
│   │   ├── store/orderStore.ts
│   │   └── types/order.types.ts
│   │
│   ├── seller/
│   │   ├── api/seller.api.ts
│   │   ├── components/AddBookForm.tsx
│   │   ├── components/BookTable.tsx
│   │   ├── components/StockEditor.tsx
│   │   ├── pages/SellerDashboard.tsx
│   │   ├── pages/AddBookPage.tsx
│   │   ├── pages/SellerOrdersPage.tsx
│   │   └── types/seller.types.ts
│   │
│   ├── admin/
│   │   ├── api/admin.api.ts
│   │   ├── components/PendingBookCard.tsx
│   │   ├── components/PendingShopCard.tsx
│   │   ├── pages/AdminBooksPage.tsx
│   │   ├── pages/AdminShopsPage.tsx
│   │   ├── pages/AdminUsersPage.tsx
│   │   └── types/admin.types.ts
│   │
│   ├── notifier/
│   │   ├── api/notification.api.ts
│   │   ├── components/NotificationBell.tsx
│   │   ├── components/NotificationItem.tsx
│   │   ├── pages/NotificationsPage.tsx
│   │   └── store/notifierStore.ts
│   │
│   ├── review/
│   │   ├── api/review.api.ts
│   │   ├── components/ReviewList.tsx
│   │   ├── components/ReviewForm.tsx
│   │   └── components/StarRating.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PublicLayout.tsx
│   │   ├── BuyerLayout.tsx
│   │   ├── SellerLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   └── modal/
│       ├── ConfirmModal.tsx
│       └── AddressModal.tsx
│
├── security/
│   ├── ProtectedRoute.tsx        # Checks isAuthenticated → redirect /login
│   ├── RoleGuard.tsx             # Checks user.role → redirect /403
│   └── withAuth.tsx              # HOC version of ProtectedRoute
│
├── style/
│   └── globals.css               # CSS reset + Apple-style body/scrollbar
│
├── theme/
│   ├── ThemeConfig.ts            # AntD ConfigProvider token config
│   ├── AppTypography.tsx         # Your company_code Typography wrapper
│   ├── typography.ts             # themeTypography object (your pattern)
│   └── colors.ts                 # Brand color constants
│
├── types/
│   ├── api.types.ts              # ApiResponse<T>, PaginatedResult<T>
│   ├── enums.ts                  # UserRole, BookStatus, OrderStatus etc.
│   └── global.d.ts               # Module declarations
│
├── App.tsx                       # ConfigProvider + RouterProvider
├── index.tsx                     # ReactDOM.createRoot
├── router.tsx                    # All routes, layouts, guards
├── constants.ts                  # Re-export from config/
└── NavigateSetter.tsx            # Programmatic navigation (your pattern)
```

---

## File Count

| Area | Files |
|---|---|
| config/ | 2 |
| hooks/ | 3 |
| modules/auth/ | 7 |
| modules/books/ | 7 |
| modules/cart/ | 6 |
| modules/orders/ | 8 |
| modules/seller/ | 8 |
| modules/admin/ | 7 |
| modules/notifier/ | 5 |
| modules/review/ | 4 |
| modules/layout/ | 6 |
| modules/modal/ | 2 |
| security/ | 3 |
| style/ | 1 |
| theme/ | 4 |
| types/ | 3 |
| Root files | 5 |
| **Total** | **81 files** |

---

## Pages (17 total)

| Page | Route | Role |
|---|---|---|
| LoginPage | /login | PUBLIC |
| RegisterPage | /register | PUBLIC |
| BooksPage | /books | PUBLIC |
| BookDetailPage | /books/:id | PUBLIC |
| CartPage | /cart | BUYER |
| CheckoutPage | /checkout | BUYER |
| OrdersPage | /orders | BUYER |
| OrderDetailPage | /orders/:id | BUYER |
| NotificationsPage | /notifications | AUTH |
| SellerDashboard | /seller | SELLER |
| AddBookPage | /seller/books/add | SELLER |
| SellerOrdersPage | /seller/orders | SELLER |
| AdminBooksPage | /admin/books | ADMIN |
| AdminShopsPage | /admin/shops | ADMIN |
| AdminUsersPage | /admin/users | ADMIN |
| NotFoundPage | * | PUBLIC |
| ForbiddenPage | /403 | PUBLIC |

---

## Import Rule (No Circular Dependencies)

```
pages
  → components (same module only)
    → store (Zustand)
    → api module
      → axiosClient (shared)
        → types/ (shared)
        → config/ (shared)

security/
  → types/ and store/ only

theme/
  → types/ only

hooks/
  → types/ only
```

Modules NEVER import from other feature modules directly.
If books/ needs cart data → it reads from cartStore, not from cart/api.

---

## Theme Pattern (follows your company_code exactly)

```tsx
// theme/ThemeConfig.ts
export const themeConfig = {
  token: {
    colorPrimary: '#0071e3',       // Apple blue
    colorBgBase: '#f5f5f7',        // Apple off-white
    borderRadius: 12,
    fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    colorText: '#1d1d1f',
  },
}

// App.tsx
<ConfigProvider theme={themeConfig}>
  <RouterProvider router={router} />
</ConfigProvider>
```

Your `Typography` component wraps AntD's `<Title>` and `<Paragraph>` using `themeTypography` tokens — identical pattern to company_code. Every text in the app uses it.

---

## Build Parts (coding order)

| Part | Files | What |
|---|---|---|
| 1 | types/, config/, theme/, axiosClient | Foundation + tokens |
| 2 | All api/ files + security/ | API layer + guards |
| 3 | authStore + LoginPage + RegisterPage | Auth flow |
| 4 | BooksPage + BookCard + BookGrid + BookFilters + BookDetailPage | Storefront |
| 5 | cartStore + CartDrawer + CheckoutPage + orderStore | Buy flow |
| 6 | Buyer orders + notifications + reviews | Order history |
| 7 | Seller dashboard + AddBookForm + SellerOrders | Seller panel |
| 8 | Admin pages + router + NavigateSetter + App | Admin + wiring |
