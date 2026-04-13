// ─────────────────────────────────────────────────────────────
// Layouts.tsx  (Part 6 — Layout)
//
// TEACH — Layout composition pattern:
// Instead of repeating <Navbar> and <CartDrawer> in every page,
// we wrap pages with a layout component. React Router v6 renders
// the layout as the parent and the matched page as the child via
// the <Outlet /> component.
//
//   router.tsx:
//     <Route element={<BuyerLayout />}>
//       <Route path="/books" element={<BooksPage />} />
//       <Route path="/cart"  element={<CartPage />} />
//     </Route>
//
// When /books is visited, React Router renders:
//   <BuyerLayout>
//     <BooksPage />     ← injected where <Outlet /> sits
//   </BuyerLayout>
//
// TEACH — Outlet:
// Outlet is React Router's "slot" — a placeholder that renders
// whichever child route matched. Without it, nested routes
// would render nowhere.
//
// TEACH — CartDrawer state lives in the Layout:
// The cart open/close state is shared between Navbar (opens it)
// and CartDrawer (reads it). Their common parent is BuyerLayout,
// so that's where we put the state.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  BookOutlined, PlusOutlined, ShoppingOutlined,
  CheckCircleOutlined, ShopOutlined, UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import CartDrawer from '@/modules/cart/components/CartDrawer'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import { ROUTES } from '@/config/constants'

// ─────────────────────────────────────────────────────────────
// BuyerLayout — wraps all buyer + public pages
// Includes: Navbar (sticky top) + CartDrawer (slide-in right)
// ─────────────────────────────────────────────────────────────
export const BuyerLayout: React.FC = () => {
  // TEACH: cartOpen state lives here — BuyerLayout is the common
  // ancestor of Navbar and CartDrawer. Both receive what they need.
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* TEACH: Layout.Content is a semantic wrapper.
          It doesn't add any visual styling but marks the main
          content area for accessibility and structure. */}
      <Layout.Content>
        {/* Outlet renders the matched child route */}
        <Outlet />
      </Layout.Content>

      {/* CartDrawer is always mounted but hidden when closed.
          open/onClose controls visibility. */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </Layout>
  )
}

// ─────────────────────────────────────────────────────────────
// SellerLayout — wraps all seller pages
// Has a sidebar for navigation between seller sections
// ─────────────────────────────────────────────────────────────
export const SellerLayout: React.FC = () => {
  const navigate   = useNavigate()
  const { pathname } = useLocation()
  const [cartOpen, setCartOpen] = useState(false)

  const menuItems = [
    {
      key:   ROUTES.SELLER,
      icon:  <ShopOutlined />,
      label: 'Dashboard',
      onClick: () => navigate(ROUTES.SELLER),
    },
    {
      key:   ROUTES.SELLER_ADD_BOOK,
      icon:  <PlusOutlined />,
      label: 'Add book',
      onClick: () => navigate(ROUTES.SELLER_ADD_BOOK),
    },
    {
      key:   ROUTES.SELLER_ORDERS,
      icon:  <ShoppingOutlined />,
      label: 'Orders',
      onClick: () => navigate(ROUTES.SELLER_ORDERS),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar onOpenCart={() => setCartOpen(true)} />

      <Layout>
        {/* TEACH: Layout.Sider is AntD's sidebar component.
            width controls its pixel width.
            theme="light" overrides the default dark sidebar. */}
        <Layout.Sider
          width={220}
          theme="light"
          style={styles.sider}
        >
          <div style={styles.siderHeader}>
            <ShopOutlined style={{ color: colors.primary, fontSize: 18 }} />
            <Typography variant="label" style={{ color: colors.textPrimary }}>
              Seller panel
            </Typography>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ border: 'none', background: 'transparent' }}
          />
        </Layout.Sider>

        <Layout.Content style={styles.siderContent}>
          <Outlet />
        </Layout.Content>
      </Layout>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </Layout>
  )
}

// ─────────────────────────────────────────────────────────────
// AdminLayout — wraps all admin pages
// Similar sidebar structure, different links
// ─────────────────────────────────────────────────────────────
export const AdminLayout: React.FC = () => {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  const menuItems = [
    {
      key:   ROUTES.ADMIN_BOOKS,
      icon:  <BookOutlined />,
      label: 'Pending books',
      onClick: () => navigate(ROUTES.ADMIN_BOOKS),
    },
    {
      key:   ROUTES.ADMIN_SHOPS,
      icon:  <ShopOutlined />,
      label: 'Pending shops',
      onClick: () => navigate(ROUTES.ADMIN_SHOPS),
    },
    {
      key:   ROUTES.ADMIN_USERS,
      icon:  <UserOutlined />,
      label: 'Users',
      onClick: () => navigate(ROUTES.ADMIN_USERS),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar onOpenCart={() => {}} />

      <Layout>
        <Layout.Sider width={220} theme="light" style={styles.sider}>
          <div style={styles.siderHeader}>
            <CheckCircleOutlined style={{ color: '#ff9500', fontSize: 18 }} />
            <Typography variant="label" style={{ color: colors.textPrimary }}>
              Admin panel
            </Typography>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ border: 'none', background: 'transparent' }}
          />
        </Layout.Sider>

        <Layout.Content style={styles.siderContent}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

// ─────────────────────────────────────────────────────────────
// PublicLayout — for login/register (no Navbar, clean fullscreen)
// ─────────────────────────────────────────────────────────────
export const PublicLayout: React.FC = () => (
  <Layout style={{ minHeight: '100vh', background: '#f5f5f7' }}>
    <Outlet />
  </Layout>
)

const styles: Record<string, React.CSSProperties> = {
  sider: {
    borderRight:  '1px solid rgba(0,0,0,0.06)',
    background:   '#fff',
    paddingTop:   12,
    minHeight:    'calc(100vh - 56px)',
    position:     'sticky',
    top:          56,
    alignSelf:    'flex-start',
    height:       'calc(100vh - 56px)',
    overflowY:    'auto',
  },
  siderHeader: {
    display:     'flex',
    alignItems:  'center',
    gap:         8,
    padding:     '12px 20px 16px',
    borderBottom:'1px solid rgba(0,0,0,0.06)',
    marginBottom: 8,
  },
  siderContent: {
    background:  '#f5f5f7',
    minHeight:   'calc(100vh - 56px)',
  },
}