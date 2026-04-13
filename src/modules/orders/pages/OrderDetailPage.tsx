// ─────────────────────────────────────────────────────────────
// OrderDetailPage.tsx  (Part 6)
//
// TEACH — AntD Descriptions:
// Descriptions renders a key-value table — perfect for showing
// entity details like order info, shipping address, payment data.
// `bordered` adds clean table borders.
// `column` controls how many columns are shown per row.
//
// TEACH — AntD Timeline:
// Timeline renders a vertical sequence of events — ideal for
// order status history. Each item has a dot (with custom color)
// and content.
//
// TEACH — Optional chaining (?.):
// order?.payment?.method safely drills through possibly-null
// objects without throwing. If any part is null/undefined,
// the whole expression returns undefined. Use ?? for fallbacks.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Descriptions, Tag, Timeline, Button, Spin,
  Divider, Rate, Form, Input, message,
} from 'antd'
import { ArrowLeftOutlined, StarOutlined } from '@ant-design/icons'
import { orderApi } from '../api/order.api'
import { reviewApi } from '@/modules/review/api/review.api'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { Order } from '@/types/api.types'

// Maps each order status to a Timeline dot color
const STATUS_TIMELINE: Record<string, { color: string; label: string }> = {
  PENDING:   { color: 'orange', label: 'Order placed — awaiting confirmation' },
  CONFIRMED: { color: 'blue',   label: 'Confirmed — seller is preparing your books' },
  SHIPPED:   { color: 'geekblue', label: 'Shipped — on its way to you' },
  DELIVERED: { color: 'green', label: 'Delivered — enjoy reading!' },
  CANCELLED: { color: 'red',   label: 'Cancelled' },
  REFUNDED:  { color: 'purple', label: 'Refunded' },
}

// Which statuses have been reached (for timeline display)
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

const OrderDetailPage: React.FC = () => {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const [order, setOrder]     = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewingBookId, setReviewingBookId] = useState<string | null>(null)
  const [reviewLoading, setReviewLoading]     = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await orderApi.getById(id)
        setOrder(res.data.data)
      } catch {
        message.error('Order not found')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSubmitReview = async (bookId: string, values: { rating: number; comment: string }) => {
    if (!order) return
    setReviewLoading(true)
    try {
      await reviewApi.submit(bookId, {
        orderId:  order.id,
        rating:   values.rating,
        comment:  values.comment,
      })
      message.success('Review submitted! Thank you.')
      setReviewingBookId(null)
      form.resetFields()
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!order) return null

  const statusIndex = STATUS_ORDER.indexOf(order.status)

  // Build timeline items — completed steps show filled dots
  const timelineItems = STATUS_ORDER.map((status, idx) => {
    const reached = idx <= statusIndex
    const info    = STATUS_TIMELINE[status]
    return {
      color:    reached ? info.color : 'gray',
      children: (
        <Typography
          variant="bodySmall"
          style={{ color: reached ? colors.textPrimary : colors.textTertiary }}
        >
          {info.label}
        </Typography>
      ),
    }
  })

  // Handle cancelled/refunded separately
  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    timelineItems.push({
      color: STATUS_TIMELINE[order.status].color,
      children: (
        <Typography variant="bodySmall" style={{ color: colors.danger }}>
          {STATUS_TIMELINE[order.status].label}
        </Typography>
      ),
    })
  }

  const isDelivered = order.status === 'DELIVERED'

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/orders')}
          style={styles.backBtn}
        >
          All orders
        </Button>

        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <Typography variant="h2Semibold" style={{ letterSpacing: '-0.02em', marginBottom: 4 }}>
              Order details
            </Typography>
            <Typography variant="bodySmall" color="secondary">
              #{order.id.slice(0, 8).toUpperCase()} · Placed {formatDate(order.placedAt)}
            </Typography>
          </div>
          <Tag
            color={STATUS_TIMELINE[order.status]?.color ?? 'default'}
            style={{ borderRadius: 980, fontSize: 13, padding: '4px 14px', fontWeight: 500 }}
          >
            {order.status}
          </Tag>
        </div>

        <div style={styles.layout}>
          {/* ── Left column ── */}
          <div style={styles.leftCol}>
            {/* Order items */}
            <div style={styles.card}>
              <Typography variant="h5Regular" style={{ marginBottom: 16 }}>Books ordered</Typography>
              {order.items.map((item) => (
                <div key={item.id}>
                  <div style={styles.itemRow}>
                    <div style={styles.itemDot} />
                    <div style={{ flex: 1 }}>
                      <Typography variant="label">{item.bookTitleSnapshot}</Typography>
                      <Typography variant="caption" color="secondary">
                        Qty {item.quantity} × ₹{item.priceAtPurchase.toLocaleString('en-IN')}
                      </Typography>
                    </div>
                    <Typography variant="label">
                      ₹{(item.quantity * item.priceAtPurchase).toLocaleString('en-IN')}
                    </Typography>
                  </div>

                  {/* Review form — shown only for DELIVERED orders */}
                  {/* TEACH: Conditional rendering with &&.
                      If isDelivered is false, nothing renders.
                      If reviewingBookId === item.bookId, show the form. */}
                  {isDelivered && (
                    <div style={{ marginLeft: 24, marginTop: 8, marginBottom: 12 }}>
                      {reviewingBookId === item.bookId ? (
                        <Form
                          form={form}
                          onFinish={(v) => handleSubmitReview(item.bookId, v)}
                          layout="vertical"
                          style={styles.reviewForm}
                        >
                          <Form.Item
                            name="rating"
                            label={<span style={{ fontSize: 12 }}>Your rating</span>}
                            rules={[{ required: true, message: 'Please rate this book' }]}
                            style={{ marginBottom: 8 }}
                          >
                            {/* TEACH: Rate inside a Form.Item — AntD wires it
                                automatically via the form instance. No onChange needed. */}
                            <Rate />
                          </Form.Item>
                          <Form.Item
                            name="comment"
                            style={{ marginBottom: 8 }}
                          >
                            <Input.TextArea
                              placeholder="Share your thoughts (optional)"
                              rows={2}
                              style={{ borderRadius: 10, background: '#f5f5f7', border: 'none' }}
                            />
                          </Form.Item>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                              htmlType="submit"
                              type="primary"
                              size="small"
                              loading={reviewLoading}
                              style={{ borderRadius: 980 }}
                            >
                              Submit
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setReviewingBookId(null)}
                              style={{ borderRadius: 980 }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <Button
                          type="text"
                          size="small"
                          icon={<StarOutlined />}
                          onClick={() => setReviewingBookId(item.bookId)}
                          style={{ color: colors.primary, padding: 0, fontSize: 12 }}
                        >
                          Write a review
                        </Button>
                      )}
                    </div>
                  )}
                  <Divider style={{ margin: '8px 0' }} />
                </div>
              ))}

              {/* Order total */}
              <div style={styles.totalRow}>
                <Typography variant="bodyMedium" color="secondary">Order total</Typography>
                <Typography variant="h4Semibold" style={{ color: colors.primary }}>
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </Typography>
              </div>
            </div>

            {/* Shipping address */}
            {/* TEACH: Descriptions component — renders key-value pairs
                in a clean grid layout. `column={1}` makes it single-column. */}
            <div style={styles.card}>
              <Typography variant="h5Regular" style={{ marginBottom: 16 }}>Shipping address</Typography>
              <Descriptions column={1} size="small" style={{ fontSize: 14 }}>
                <Descriptions.Item label="Street">{order.shippingStreet}</Descriptions.Item>
                <Descriptions.Item label="City">{order.shippingCity}</Descriptions.Item>
                <Descriptions.Item label="State">{order.shippingState}</Descriptions.Item>
                <Descriptions.Item label="Pincode">{order.shippingPincode}</Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={styles.rightCol}>
            {/* Status timeline */}
            <div style={styles.card}>
              <Typography variant="h5Regular" style={{ marginBottom: 20 }}>Order progress</Typography>
              <Timeline items={timelineItems} />
            </div>

            {/* Payment info */}
            {order.payment && (
              <div style={styles.card}>
                <Typography variant="h5Regular" style={{ marginBottom: 16 }}>Payment</Typography>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Method">
                    {order.payment.method.replace('_', ' ')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={order.payment.status === 'SUCCESS' ? 'green' : 'orange'}
                      style={{ borderRadius: 980 }}
                    >
                      {order.payment.status}
                    </Tag>
                  </Descriptions.Item>
                  {order.payment.transactionId && (
                    <Descriptions.Item label="Txn ID">
                      <Typography variant="caption" style={{ fontFamily: 'monospace' }}>
                        {order.payment.transactionId}
                      </Typography>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Amount">
                    ₹{order.payment.amount.toLocaleString('en-IN')}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:       { minHeight: '100vh', background: '#f5f5f7', paddingBottom: 60 },
  container:  { maxWidth: 1000, margin: '0 auto', padding: '32px 24px' },
  backBtn:    { marginBottom: 20, color: colors.primary, padding: 0 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  layout:     { display: 'flex', gap: 24, alignItems: 'flex-start' },
  leftCol:    { flex: '1 1 60%', minWidth: 0 },
  rightCol:   { flex: '1 1 36%', minWidth: 0 },
  card: {
    background: '#fff', borderRadius: 16, padding: 24,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  itemRow:    { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  itemDot:    { width: 8, height: 8, borderRadius: '50%', background: colors.primary, marginTop: 6, flexShrink: 0 },
  totalRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  reviewForm: { background: '#f5f5f7', borderRadius: 12, padding: 12 },
}

export default OrderDetailPage