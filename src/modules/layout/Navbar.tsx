// ─────────────────────────────────────────────────────────────
// Navbar.tsx  (Part 6 — Layout)
//
// TEACH — AntD Layout.Header:
// AntD provides Layout, Layout.Header, Layout.Content, Layout.Sider
// as structural building blocks. Header gives you a semantic
// <header> with a default dark background (we override to white).
//
// TEACH — useLocation + active link detection:
// React Router's useLocation() returns the current URL pathname.
// We compare it against each nav link to highlight the active one.
// This is how "active nav item" works without a router-specific
// NavLink (which we could also use, but style gives more control).
//
// TEACH — Lifting state up for the CartDrawer:
// The Navbar needs to toggle the CartDrawer.
// The CartDrawer is NOT a child of Navbar — it's a sibling.
// Solution: Navbar receives `onOpenCart` as a prop from the
// Layout component that owns the `cartOpen` state.
// This is "lifting state up" — the classic React pattern.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { Layout, Button, Avatar, Dropdown, Badge } from 'antd'
import {
  ShoppingCartOutlined, UserOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/store/authStore'
import { useCartStore } from '@/modules/cart/store/CartStore'
import NotificationBell from '@/modules/notifier/pages/NotificationBell'
import { authApi } from '@/modules/auth/api/auth.api'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import { ROUTES } from '@/config/constants'

interface NavbarProps {
  onOpenCart: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const navigate            = useNavigate()
  const { pathname }        = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount }       = useCartStore()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  // Public nav links (visible to everyone)
  const publicLinks = [
    { label: 'Books', path: ROUTES.BOOKS },
  ]

  // Role-specific nav links
  const roleLinks: Record<string, { label: string; path: string }[]> = {
    BUYER:  [
      { label: 'Orders', path: ROUTES.ORDERS },
    ],
    SELLER: [
      { label: 'Dashboard', path: ROUTES.SELLER },
      { label: 'My Orders',  path: ROUTES.SELLER_ORDERS },
    ],
    ADMIN:  [
      { label: 'Books',  path: ROUTES.ADMIN_BOOKS },
      { label: 'Shops',  path: ROUTES.ADMIN_SHOPS },
      { label: 'Users',  path: ROUTES.ADMIN_USERS },
    ],
  }

  const links = [
    ...publicLinks,
    ...(user ? (roleLinks[user.role] ?? []) : []),
  ]

  // User dropdown menu items
  const userMenuItems = [
    {
      key: 'role',
      label: (
        <Typography variant="caption" color="secondary">
          Signed in as {user?.role}
        </Typography>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <Layout.Header style={styles.header}>
      {/* ── Brand ── */}
      <div style={styles.brand} onClick={() => navigate(ROUTES.BOOKS)}>
        <span style={{ fontSize: 20 }}>📚</span>
        <Typography variant="h5Regular" style={styles.brandText}>
          BookBazaar
        </Typography>
      </div>

      {/* ── Nav links ── */}
      <nav style={styles.nav}>
        {links.map((link) => {
          const isActive = pathname === link.path || pathname.startsWith(link.path + '/')
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                ...styles.navLink,
                color:      isActive ? colors.primary : colors.textPrimary,
                fontWeight: isActive ? 600 : 400,
                background: isActive ? colors.primaryLight : 'transparent',
              }}
            >
              {link.label}
            </button>
          )
        })}
      </nav>

      {/* ── Right side ── */}
      <div style={styles.rightSide}>
        {isAuthenticated ? (
          <>
            {/* Notification bell (only for authenticated users) */}
            <NotificationBell />

            {/* Cart button — only for buyers */}
            {user?.role === 'BUYER' && (
              <Badge count={itemCount} size="small" overflowCount={9}>
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: 18 }} />}
                  onClick={onOpenCart}
                  style={styles.iconBtn}
                />
              </Badge>
            )}

            {/* User avatar + dropdown */}
            {/* TEACH: Dropdown wraps any element. items[] defines
                the menu. menu.onClick fires with { key } so you
                can handle multiple items in one handler or per-item
                onClick as we do here. */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Avatar
                size={32}
                style={styles.avatar}
                // Show initials from user's name
              >
                {user?.name?.[0]?.toUpperCase() ?? <UserOutlined />}
              </Avatar>
            </Dropdown>
          </>
        ) : (
          <>
            <Button
              type="text"
              onClick={() => navigate(ROUTES.LOGIN)}
              style={styles.ghostBtn}
            >
              Sign in
            </Button>
            <Button
              type="primary"
              onClick={() => navigate(ROUTES.REGISTER)}
              style={styles.primaryBtn}
            >
              Get started
            </Button>
          </>
        )}
      </div>
    </Layout.Header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position:         'sticky',
    top:              0,
    zIndex:           100,
    height:           56,
    display:          'flex',
    alignItems:       'center',
    background:       'rgba(255,255,255,0.85)',
    backdropFilter:   'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom:     '1px solid rgba(0,0,0,0.06)',
    padding:          '0 24px',
    gap:              24,
  },
  brand: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    cursor:     'pointer',
    flexShrink: 0,
  },
  brandText: {
    letterSpacing: '-0.02em',
    color: colors.textPrimary,
  },
  nav: {
    display:    'flex',
    alignItems: 'center',
    gap:        4,
    flex:       1,
  },
  navLink: {
    padding:      '5px 12px',
    borderRadius: 980,
    border:       'none',
    fontSize:     14,
    cursor:       'pointer',
    transition:   'all 0.15s',
    fontFamily:   '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    lineHeight:   1,
  },
  rightSide: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    flexShrink: 0,
  },
  iconBtn: {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    color:           colors.textPrimary,
  },
  avatar: {
    background:  colors.primary,
    cursor:      'pointer',
    fontWeight:  600,
    fontSize:    13,
  },
  ghostBtn: {
    borderRadius: 980,
    color:        colors.textPrimary,
  },
  primaryBtn: {
    borderRadius: 980,
    fontWeight:   500,
  },
}

export default Navbar