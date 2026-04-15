// ─────────────────────────────────────────────────────────────
// router.tsx
//
// TEACH — React Router v6 createBrowserRouter:
// The modern way to define routes (replaces <BrowserRouter> +
// <Routes> JSX). Benefits:
//   - Data loading (loaders/actions) — future-proof
//   - All routes visible in one file — easy to audit
//   - Nested routes via children[] — layouts work naturally
//
// TEACH — Nested routes pattern:
// A parent route with element={<Layout />} renders that layout.
// Its children render inside the layout's <Outlet />.
// The path of the child is APPENDED to the parent's path.
//
// Example:
//   { path: '/books', element: <BuyerLayout />, children: [
//     { path: '', element: <BooksPage /> }   → matches /books
//     { path: ':id', element: <BookDetailPage /> } → matches /books/123
//   ]}
//
// TEACH — index route:
// { index: true, element: <X /> } matches the parent path exactly.
// Same as { path: '' } but more explicit in intent.
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import {
  PublicLayout, BuyerLayout, SellerLayout, AdminLayout,
} from './modules/layout/Layouts';

// Security
import { ProtectedRoute, RoleGuard } from './security';

// Auth pages
import LoginPage    from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';

// Book pages
import BooksPage      from './modules/books/pages/BookPage';
import BookDetailPage from './modules/books/pages/Bookdetailpage';

// Cart + Checkout
import CartPage     from './modules/cart/pages/CartPage';
import CheckoutPage from './modules/orders/pages/Checkoutpage';

// Order pages
import OrdersPage      from './modules/orders/pages/OrderPage';
import OrderDetailPage from './modules/orders/pages/OrderDetailPage';

// Notifications
import NotificationsPage from './modules/notifier/pages/NotificationsPage';

// Seller pages — lazy loaded for code splitting
// TEACH: React.lazy() + Suspense = code splitting.
// The seller bundle is only downloaded when a seller visits
// a seller route. Buyers never download that JS at all.
// This keeps the initial load fast for 90% of users (buyers).
const SellerDashboard  = React.lazy(() => import('./modules/seller/pages/SellerDashboard'))
const AddBookPage      = React.lazy(() => import('./modules/seller/pages/AddBookPage'))
const SellerOrdersPage = React.lazy(() => import('./modules/seller/pages/SellerOrdersPage'))

// Admin pages — also lazy
const AdminBooksPage = React.lazy(() => import('./modules/admin/pages/AdminBooksPage'))
const AdminShopsPage = React.lazy(() => import('./modules/admin/pages/AdminShopsPage'))
const AdminUsersPage = React.lazy(() => import('./modules/admin/pages/AdminUsersPage'))

// Utility pages
import ForbiddenPage from './modules/layout/ForbiddenPage'
import NotFoundPage  from './modules/layout/NotFoundPage'

export const router = createBrowserRouter([
  // ── Public routes (no auth required) ──────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // ── Main app routes (auth optional — auth handled per-page) ─
  {
    element: <BuyerLayout />,
    children: [
      // Root redirect
      { path: '/', element: <Navigate to="/books" replace /> },

      // Public book pages (no auth needed)
      { path: '/books',     element: <BooksPage /> },
      { path: '/books/:id', element: <BookDetailPage /> },

      // Buyer-only pages
      {
        path: '/cart',
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={['BUYER']}>
              <CartPage />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: '/checkout',
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={['BUYER']}>
              <CheckoutPage />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={['BUYER']}>
              <OrdersPage />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders/:id',
        element: (
          <ProtectedRoute>
            <RoleGuard allowedRoles={['BUYER']}>
              <OrderDetailPage />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: '/notifications',
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },

      // Error pages
      { path: '/403', element: <ForbiddenPage /> },
      { path: '*',    element: <NotFoundPage /> },
    ],
  },

  // ── Seller routes ──────────────────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['SELLER']}>
          <SellerLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      // TEACH: React.Suspense catches the lazy load promise and
      // shows fallback until the chunk downloads and renders.
      { path: '/seller',        element: <React.Suspense fallback={null}><SellerDashboard /></React.Suspense> },
      { path: '/seller/books/add', element: <React.Suspense fallback={null}><AddBookPage /></React.Suspense> },
      { path: '/seller/orders', element: <React.Suspense fallback={null}><SellerOrdersPage /></React.Suspense> },
    ],
  },

  // ── Admin routes ───────────────────────────────────────────
  {
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['ADMIN']}>
          <AdminLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin/books', element: <React.Suspense fallback={null}><AdminBooksPage /></React.Suspense> },
      { path: '/admin/shops', element: <React.Suspense fallback={null}><AdminShopsPage /></React.Suspense> },
      { path: '/admin/users', element: <React.Suspense fallback={null}><AdminUsersPage /></React.Suspense> },
    ],
  },
])