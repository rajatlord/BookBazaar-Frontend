 
import { useEffect } from 'react'
import { Spin, Button, Divider, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useCartStore } from '@/modules/cart/store/CartStore'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import { useNavigate } from 'react-router-dom'


export const CartPage: React.FC = () => {
  const { cart, loading, fetchCart, removeItem } = useCartStore()
  const navigate = useNavigate()
 
  useEffect(() => { fetchCart() }, [])  // eslint-disable-line
 
  if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>
 
  const isEmpty = !cart || cart.items.length === 0
 
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <Typography variant="h2Semibold" style={{ marginBottom: 32, letterSpacing: '-0.02em' }}>Shopping cart</Typography>
 
      {isEmpty ? (
        <Empty description="Your cart is empty">
          <Button type="primary" onClick={() => navigate('/books')} style={{ borderRadius: 980, marginTop: 16 }}>Browse books</Button>
        </Empty>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {cart!.items.map((item) => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 56, height: 72, borderRadius: 10, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" style={{ color: '#fff', fontWeight: 700 }}>{item.bookTitle.slice(0,2).toUpperCase()}</Typography>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography variant="label">{item.book.title}</Typography>
                  <Typography variant="caption" color="secondary" style={{ display: 'block', marginTop: 2 }}>by {item.book.author}</Typography>
                  <Typography variant="bodyMedium" style={{ color: colors.primary, marginTop: 6 }}>₹{item.priceAtAddTime.toLocaleString('en-IN')} × {item.quantity}</Typography>
                </div>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.id)} />
              </div>
            ))}
          </div>
          <div style={{ width: 260, flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <Typography variant="h5Regular" style={{ marginBottom: 16 }}>Summary</Typography>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography variant="bodySmall" color="secondary">Items ({cart!.items.length})</Typography>
                <Typography variant="bodySmall">₹{cart!.totalAmount.toLocaleString('en-IN')}</Typography>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography variant="bodySmall" color="secondary">Delivery</Typography>
                <Typography variant="bodySmall" style={{ color: colors.success }}>Free</Typography>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Typography variant="label">Total</Typography>
                <Typography variant="h4Semibold">₹{cart!.totalAmount.toLocaleString('en-IN')}</Typography>
              </div>
              <Button type="primary" block size="large" onClick={() => navigate('/checkout')} style={{ borderRadius: 980, fontWeight: 500 }}>Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
 
export default CartPage