// ─────────────────────────────────────────────────────────────
// CheckoutPage.tsx  (Part 5)
//
// TEACH — AntD Steps:
// Steps is a wizard/stepper component. It shows progress through
// a multi-step process. `current` controls which step is active.
// We increment it as the user moves forward.
//
// TEACH — Controlled multi-step forms:
// Each step has its own form or selection UI. We hold all the
// collected data in component state and only submit everything
// in the final step. This is the "collect then submit" pattern.
//
// TEACH — useEffect on mount (fetch prerequisites):
// The checkout page needs addresses before the user can proceed.
// We fetch them on mount. If the user has no address, we show
// an "Add address" form inline.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Steps, Button, Form, Input, Radio, Card, message, Result, Spin } from 'antd';
import {
  HomeOutlined, CreditCardOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api/order.api';
import { addressApi } from '../api/address.api';
import { useCartStore } from '@/modules/cart/store/CartStore';
import { extractApiError } from '@/api/axiosClient';
import { Typography } from '@/theme/AppTypography';
import { colors } from '@/theme/colors';
import type { Address, Order } from '@/types/api.types';

const PAYMENT_METHODS = [
  { value: 'UPI',         label: '📱 UPI',         desc: 'Google Pay, PhonePe, Paytm' },
  { value: 'CREDIT_CARD', label: '💳 Credit card',  desc: 'Visa, Mastercard, Amex' },
  { value: 'DEBIT_CARD',  label: '💳 Debit card',   desc: 'All Indian banks' },
  { value: 'WALLET',      label: '👛 Wallet',        desc: 'BookBazaar wallet balance' },
]

const CheckoutPage: React.FC = () => {
  const [current, setCurrent]           = useState(0)
  const [addresses, setAddresses]       = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod]     = useState('UPI')
  const [loading, setLoading]           = useState(false)
  const [addressLoading, setAddressLoading]   = useState(true)
  const [completedOrder, setCompletedOrder]   = useState<Order | null>(null)
  const [addingAddress, setAddingAddress]     = useState(false)
  const [addressForm] = Form.useForm()

  const { cart, clearLocalCart } = useCartStore()
  const navigate = useNavigate()

  // Fetch saved addresses on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await addressApi.getAll()
        const addrs = res.data.data
        setAddresses(addrs)
        // Auto-select default address
        const def = addrs.find((a) => a.isDefault)
        if (def) setSelectedAddress(def.id)
      } catch { /* no addresses yet */ }
      finally { setAddressLoading(false) }
    }
    load()
  }, [])

  const handleAddAddress = async (values: Omit<Address, 'id' | 'buyerId'>) => {
    setAddingAddress(true)
    try {
      const res = await addressApi.create(values)
      const newAddr = res.data.data
      setAddresses((prev) => [...prev, newAddr])
      setSelectedAddress(newAddr.id)
      addressForm.resetFields()
      message.success('Address saved!')
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setAddingAddress(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { message.warning('Please select a delivery address'); return }
    setLoading(true)
    try {
      const res = await orderApi.place({ addressId: selectedAddress, paymentMethod })
      setCompletedOrder(res.data.data)
      clearLocalCart()          // wipe local Zustand cart (no need to re-fetch)
      setCurrent(3)             // jump to success step
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={styles.page}>
        <Result
          icon={<span style={{ fontSize: 48 }}>🛒</span>}
          title="Your cart is empty"
          subTitle="Add some books before checking out"
          extra={
            <Button type="primary" onClick={() => navigate('/books')} style={{ borderRadius: 980 }}>
              Browse books
            </Button>
          }
        />
      </div>
    )
  }

  // ── Step content ───────────────────────────────────────────
  const StepAddress = (
    <div style={styles.stepContent}>
      <Typography variant="h4Semibold" style={{ marginBottom: 20 }}>Delivery address</Typography>

      {addressLoading ? (
        <Spin />
      ) : (
        <>
          {/* Existing addresses */}
          {addresses.length > 0 && (
            // TEACH: Radio.Group with custom card-style children.
            // Radio.Group manages selection state; we mirror it in
            // `selectedAddress`. Clicking a card selects its Radio.
            <Radio.Group
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              style={{ width: '100%', marginBottom: 24 }}
            >
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  style={{
                    ...styles.addrCard,
                    borderColor: selectedAddress === addr.id ? colors.primary : 'transparent',
                    background:  selectedAddress === addr.id ? colors.primaryLight : '#f5f5f7',
                  }}
                >
                  <Radio value={addr.id} />
                  <div style={{ marginLeft: 8 }}>
                    <Typography variant="label">{addr.street}</Typography>
                    <Typography variant="caption" color="secondary">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </Typography>
                    {addr.isDefault && (
                      <span style={styles.defaultBadge}>Default</span>
                    )}
                  </div>
                </div>
              ))}
            </Radio.Group>
          )}

          {/* Add new address */}
          <Typography variant="label" style={{ marginBottom: 12, display: 'block' }}>
            {addresses.length === 0 ? 'Add a delivery address' : 'Or add a new address'}
          </Typography>
          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleAddAddress}
            requiredMark={false}
          >
            <Form.Item name="street" label="Street" rules={[{ required: true }]}>
              <Input style={styles.input} placeholder="123, MG Road" />
            </Form.Item>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input style={styles.input} placeholder="Delhi" />
              </Form.Item>
              <Form.Item name="state" label="State" rules={[{ required: true }]}>
                <Input style={styles.input} placeholder="Delhi" />
              </Form.Item>
            </div>
            <Form.Item name="pincode" label="Pincode" rules={[{ required: true }, { len: 6, message: '6 digits' }]}>
              <Input style={styles.input} placeholder="110001" maxLength={6} />
            </Form.Item>
            <Button htmlType="submit" loading={addingAddress} style={{ borderRadius: 980 }}>
              Save address
            </Button>
          </Form>
        </>
      )}

      <Button
        type="primary"
        disabled={!selectedAddress}
        onClick={() => setCurrent(1)}
        style={{ ...styles.nextBtn, marginTop: 24 }}
      >
        Continue to payment
      </Button>
    </div>
  )

  const StepPayment = (
    <div style={styles.stepContent}>
      <Typography variant="h4Semibold" style={{ marginBottom: 20 }}>Payment method</Typography>
      <Radio.Group
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ width: '100%' }}
      >
        {PAYMENT_METHODS.map((pm) => (
          <div
            key={pm.value}
            onClick={() => setPaymentMethod(pm.value)}
            style={{
              ...styles.payCard,
              borderColor: paymentMethod === pm.value ? colors.primary : 'transparent',
              background:  paymentMethod === pm.value ? colors.primaryLight : '#f5f5f7',
              marginBottom: 10,
            }}
          >
            <Radio value={pm.value} />
            <div style={{ marginLeft: 12 }}>
              <Typography variant="label">{pm.label}</Typography>
              <Typography variant="caption" color="secondary">{pm.desc}</Typography>
            </div>
          </div>
        ))}
      </Radio.Group>
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Button onClick={() => setCurrent(0)} style={{ borderRadius: 980 }}>Back</Button>
        <Button type="primary" onClick={() => setCurrent(2)} style={styles.nextBtn}>
          Review order
        </Button>
      </div>
    </div>
  )

  const StepReview = (
    <div style={styles.stepContent}>
      <Typography variant="h4Semibold" style={{ marginBottom: 20 }}>Review order</Typography>

      {/* Order summary */}
      <Card style={{ borderRadius: 16, border: 'none', background: '#f5f5f7', marginBottom: 16 }}>
        {cart.items.map((item) => (
          <div key={item.id} style={styles.summaryRow}>
            <Typography variant="bodySmall">
              {item.bookTitle} × {item.quantity}
            </Typography>
            <Typography variant="bodySmall">
              ₹{(item.priceAtAddTime * item.quantity).toLocaleString('en-IN')}
            </Typography>
          </div>
        ))}
        <div style={{ ...styles.summaryRow, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h5Regular">Total</Typography>
          <Typography variant="h4Semibold" style={{ color: colors.primary }}>
            ₹{cart.totalAmount.toLocaleString('en-IN')}
          </Typography>
        </div>
      </Card>

      <Typography variant="caption" color="secondary" style={{ marginBottom: 20, display: 'block' }}>
        Payment via {paymentMethod.replace('_', ' ')} · {
          addresses.find(a => a.id === selectedAddress)?.city ?? ''
        }
      </Typography>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={() => setCurrent(1)} style={{ borderRadius: 980 }}>Back</Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handlePlaceOrder}
          style={{ ...styles.nextBtn, background: '#34c759', borderColor: '#34c759' }}
        >
          Place order — ₹{cart.totalAmount.toLocaleString('en-IN')}
        </Button>
      </div>
    </div>
  )

  const StepSuccess = completedOrder && (
    <Result
      icon={<CheckCircleOutlined style={{ color: '#34c759', fontSize: 64 }} />}
      title="Order placed!"
      subTitle={`Order #${completedOrder.id.slice(0, 8).toUpperCase()} confirmed. You'll receive an email shortly.`}
      extra={[
        <Button
          key="orders"
          type="primary"
          onClick={() => navigate('/orders')}
          style={{ borderRadius: 980 }}
        >
          View my orders
        </Button>,
        <Button key="books" onClick={() => navigate('/books')} style={{ borderRadius: 980 }}>
          Continue shopping
        </Button>,
      ]}
    />
  )

  const stepItems = [
    { title: 'Address',  icon: <HomeOutlined /> },
    { title: 'Payment',  icon: <CreditCardOutlined /> },
    { title: 'Review',   icon: <CheckCircleOutlined /> },
    { title: 'Confirm',  icon: <CheckCircleOutlined /> },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Typography variant="h2Semibold" style={{ marginBottom: 32, letterSpacing: '-0.02em' }}>
          Checkout
        </Typography>

        {/* TEACH: Steps shows where the user is in the flow.
            current={0} highlights the first step etc. */}
        <Steps
          current={current}
          items={stepItems}
          style={{ marginBottom: 40 }}
        />

        {current === 0 && StepAddress}
        {current === 1 && StepPayment}
        {current === 2 && StepReview}
        {current === 3 && StepSuccess}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f7', padding: '40px 0 60px' },
  container: { maxWidth: 680, margin: '0 auto', padding: '0 24px' },
  stepContent: { background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  input: { background: '#f5f5f7', border: '1px solid transparent', borderRadius: 12 },
  nextBtn: { borderRadius: 980, fontWeight: 500, flex: 1 },
  addrCard: {
    display: 'flex', alignItems: 'flex-start',
    padding: '14px 16px', borderRadius: 12,
    border: '1.5px solid', marginBottom: 10, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  payCard: {
    display: 'flex', alignItems: 'center',
    padding: '14px 16px', borderRadius: 12,
    border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
  },
  defaultBadge: {
    display: 'inline-block', marginTop: 4,
    background: colors.primaryLight, color: colors.primary,
    borderRadius: 980, fontSize: 11, padding: '1px 8px', fontWeight: 500,
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
}

export default CheckoutPage