// ─────────────────────────────────────────────────────────────
// CartDrawer.tsx  (Part 5)
//
// TEACH — AntD Drawer:
// A Drawer slides in from an edge (right by default). It's
// controlled: you own `open` state, pass it as a prop, and
// pass onClose to handle closing. AntD handles the animation,
// backdrop, and focus trap automatically.
//
// This is the "slide-out cart" pattern used by Apple, Amazon,
// and Shopify — the cart appears without losing context of what
// the user was browsing.
//
// TEACH — Component communication (lifting state up):
// CartDrawer needs to know if it's open/closed.
// The Navbar button triggers it. They're siblings — neither is
// the parent of the other. Solution: lift the open state to
// their common parent (the layout component).
// CartDrawer receives { open, onClose } as props.
// Navbar receives { onOpenCart } as a prop.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { Drawer, Button, Empty, Spin, Divider, Popconfirm } from 'antd'
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/CartStore'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import { message } from 'antd'

interface CartDrawerProps {
  open:    boolean
  onClose: () => void
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { cart, loading, removeItem, fetchCart } = useCartStore()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch cart when drawer opens (in case it's stale)
  React.useEffect(() => {
    if (open) fetchCart()
  }, [open])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId)
    try {
      await removeItem(itemId)
      message.success('Removed from cart')
    } catch (err) {
      message.error('Failed to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    // TEACH: Drawer props breakdown —
    // placement="right" → slides from right edge
    // width={420}       → fixed width in pixels
    // footer            → sticky footer content (perfect for checkout button)
    // destroyOnClose    → unmount children when closed (saves memory)
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingOutlined style={{ color: colors.primary }} />
          <Typography variant="h5Regular">My cart</Typography>
          {cart && cart.items.length > 0 && (
            <span style={styles.countPill}>{cart.items.length}</span>
          )}
        </div>
      }
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
      footer={
        !isEmpty && (
          <div style={styles.footer}>
            <div style={styles.totalRow}>
              <Typography variant="bodyMedium" color="secondary">Total</Typography>
              <Typography variant="h4Semibold">
                ₹{cart!.totalAmount.toLocaleString('en-IN')}
              </Typography>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleCheckout}
              style={styles.checkoutBtn}
            >
              Proceed to checkout
            </Button>
          </div>
        )
      }
    >
      {loading ? (
        <div style={styles.center}><Spin /></div>
      ) : isEmpty ? (
        <div style={styles.center}>
          <Empty
            description={
              <Typography variant="bodyMedium" color="secondary">
                Your cart is empty
              </Typography>
            }
          />
          <Button
            type="primary"
            onClick={() => { onClose(); navigate('/books') }}
            style={{ marginTop: 16, borderRadius: 980 }}
          >
            Browse books
          </Button>
        </div>
      ) : (
        <div>
          {cart!.items.map((item, idx) => (
            <div key={item.id}>
              <div style={styles.cartItem}>
                {/* Book color block */}
                <div style={{ ...styles.itemCover, background: getItemColor(idx) }}>
                  <Typography variant="caption" style={{ color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 10 }}>
                    {item.bookTitle.slice(0, 2).toUpperCase()?? '??'}
                  </Typography>
                </div>

                <div style={styles.itemBody}>
                  <Typography variant="label" style={{ marginBottom: 2 }}>
                    {item.bookTitle.length > 35
                      ? item.bookTitle?.slice(0, 35) + '…'
                      : item.bookTitle}
                  </Typography>
                  {/* <Typography variant="caption" color="secondary">
                    by {item.book.author}
                  </Typography> */}
                  <div style={styles.itemPriceRow}>
                    <Typography variant="bodyMedium" style={{ color: colors.primary }}>
                      ₹{(item.priceAtAddTime * item.quantity).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      ₹{item.priceAtAddTime.toLocaleString('en-IN')} × {item.quantity}
                    </Typography>
                  </div>
                </div>

                {/* TEACH: Popconfirm wraps a button and shows a small
                    confirmation popup before firing onConfirm.
                    Much lighter than a full Modal for destructive actions. */}
                <Popconfirm
                  title="Remove this book?"
                  onConfirm={() => handleRemove(item.id)}
                  okText="Remove"
                  cancelText="Keep"
                  okButtonProps={{ danger: true, style: { borderRadius: 980 } }}
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    loading={removingId === item.id}
                    style={{ flexShrink: 0 }}
                  />
                </Popconfirm>
              </div>
              {idx < cart!.items.length - 1 && <Divider style={{ margin: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}

const ITEM_COLORS = ['#0071e3', '#5856d6', '#34c759', '#ff9500', '#af52de', '#ff3b30']
const getItemColor = (idx: number) => ITEM_COLORS[idx % ITEM_COLORS.length]

const styles: Record<string, React.CSSProperties> = {
  center: {
    minHeight: 300, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  countPill: {
    background: colors.primary, color: '#fff',
    borderRadius: 980, fontSize: 11, fontWeight: 600,
    padding: '1px 7px',
  },
  footer: { padding: '16px 0 0' },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  checkoutBtn: { borderRadius: 980, height: 48, fontWeight: 500 },
  cartItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 20px',
  },
  itemCover: {
    width: 48, height: 64, borderRadius: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemPriceRow: {
    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
  },
}

export default CartDrawer