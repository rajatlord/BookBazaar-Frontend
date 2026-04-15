// ─────────────────────────────────────────────────────────────
// SellerDashboard.tsx  (Part 7)
//
// TEACH — AntD Statistic:
// Statistic renders a metric card with a value and label.
// valueStyle lets you color the number. prefix/suffix add units.
// Perfect for KPI dashboards.
//
// TEACH — Conditional rendering for "setup" flows:
// New sellers haven't created a shop yet. The dashboard detects
// this (shop === null after fetch) and renders a setup screen
// instead of the main dashboard. Once the shop is created, the
// state updates and the dashboard appears — no page reload.
//
// TEACH — Form in a Modal:
// When you need a form inside a Modal, give the Form its own
// form instance (Form.useForm) and call form.submit() from the
// Modal's onOk. The Form's onFinish fires as usual.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import {
  Row, Col, Card, Statistic, Button, Tag, Modal,
  Form, Input, Spin, Empty, message, Table,
} from 'antd'
import {
  ShopOutlined, BookOutlined,
  PlusOutlined, RiseOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { sellerApi } from '../api/seller.api'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { Shop, Book, Order } from '@/types/api.types'
import type { ColumnsType } from 'antd/es/table'

const SellerDashboard: React.FC = () => {
  const [shop, setShop]               = useState<Shop | null>(null)
  const [books, setBooks]             = useState<Book[]>([])
  const [orders, setOrders]           = useState<Order[]>([])
  const [loading, setLoading]         = useState(true)
  const [shopModalOpen, setShopModalOpen] = useState(false)
  const [shopLoading, setShopLoading] = useState(false)
  const [shopForm] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // TEACH: Promise.allSettled — even if getMyShop fails
        // (new seller, no shop yet) the other calls still resolve.
        const [shopRes, booksRes, ordersRes] = await Promise.allSettled([
          sellerApi.getMyShop(),
          sellerApi.getMyBooks({ limit: 5 }),
          sellerApi.getOrders({ limit: 5 }),
        ])
        if (shopRes.status === 'fulfilled')   setShop(shopRes.value.data.data  ?? [])
        if (booksRes.status === 'fulfilled')  setBooks(booksRes.value.data.data.data  ?? [])
        if (ordersRes.status === 'fulfilled')
  setOrders(ordersRes.value.data.data.data ?? [])
      } catch { /* handled below */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleCreateShop = async (values: { name: string; description?: string }) => {
    setShopLoading(true)
    try {
      const res = await sellerApi.createShop(values)
      setShop(res.data.data)
      setShopModalOpen(false)
      shopForm.resetFields()
      message.success('Shop created! It will be reviewed within 24h.')
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setShopLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <Spin size="large" />
      </div>
    )
  }

  // ── No shop yet — setup screen ─────────────────────────────
  if (!shop) {
    return (
      <div style={styles.setupPage}>
        <div style={styles.setupCard}>
          <div style={styles.setupIcon}>
            <ShopOutlined style={{ fontSize: 40, color: colors.primary }} />
          </div>
          <Typography variant="h2Semibold" style={{ marginBottom: 12, letterSpacing: '-0.02em' }}>
            Set up your shop
          </Typography>
          <Typography variant="bodyLarge" color="secondary" style={{ marginBottom: 32, maxWidth: 400 }}>
            Create your shop to start listing books. Our team reviews new shops within 24 hours.
          </Typography>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setShopModalOpen(true)}
            style={styles.primaryBtn}
          >
            Create your shop
          </Button>
        </div>

        {/* Shop creation modal */}
        <Modal
          title={<Typography variant="h4Semibold">Create your shop</Typography>}
          open={shopModalOpen}
          onCancel={() => setShopModalOpen(false)}
          // TEACH: Modal's onOk triggers form.submit() programmatically.
          // The Form's onFinish handles the actual submission.
          // This way the Modal controls the button loading state.
          onOk={() => shopForm.submit()}
          okText="Create shop"
          confirmLoading={shopLoading}
          okButtonProps={{ style: { borderRadius: 980 } }}
          cancelButtonProps={{ style: { borderRadius: 980 } }}
        >
          <Form
            form={shopForm}
            layout="vertical"
            onFinish={handleCreateShop}
            requiredMark={false}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="name"
              label="Shop name"
              rules={[
                { required: true, message: 'Shop name is required' },
                { min: 3, message: 'At least 3 characters' },
              ]}
            >
              <Input style={styles.input} placeholder="Rajat's Bookstore" size="large" />
            </Form.Item>
            <Form.Item name="description" label="Description (optional)">
              <Input.TextArea
                rows={3}
                placeholder="Tell buyers about your collection…"
                style={{ ...styles.input, height: 'auto' }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }

  // ── Main dashboard ─────────────────────────────────────────
  const verifiedBooks = books.filter((b) => b.status === 'VERIFIED').length
  const pendingBooks  = books.filter((b) => b.status === 'PENDING_VERIFICATION').length
  const totalRevenue  = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const bookColumns: ColumnsType<Book> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (t: string) => (
        <Typography variant="bodySmall" style={{ fontWeight: 500 }}>
          {t.length > 36 ? t.slice(0, 36) + '…' : t}
        </Typography>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (p: number) => <Typography variant="bodySmall">₹{p.toLocaleString('en-IN')}</Typography>,
    },
    {
      title: 'Stock',
      dataIndex: 'stockCount',
      render: (s: number) => (
        <Tag color={s === 0 ? 'red' : s < 5 ? 'orange' : 'green'} style={{ borderRadius: 980 }}>
          {s} left
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => {
        const color = s === 'VERIFIED' ? 'green' : s === 'REJECTED' ? 'red' : 'orange'
        return <Tag color={color} style={{ borderRadius: 980 }}>{s.replace('_', ' ')}</Tag>
      },
    },
  ]

  const orderColumns: ColumnsType<Order> = [
    {
      title: 'Order',
      dataIndex: 'id',
      render: (id: string) => (
        <Typography variant="caption" style={{ fontFamily: 'monospace', color: colors.primary }}>
          #{id.slice(0, 8).toUpperCase()}
        </Typography>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (v: number) => <Typography variant="bodySmall">₹{v.toLocaleString('en-IN')}</Typography>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => {
        const colorMap: Record<string, string> = {
          PENDING: 'orange', CONFIRMED: 'blue', SHIPPED: 'geekblue', DELIVERED: 'green',
        }
        return <Tag color={colorMap[s] ?? 'default'} style={{ borderRadius: 980 }}>{s}</Tag>
      },
    },
    {
      title: '',
      render: (_: unknown, record: Order) =>
        record.status === 'CONFIRMED' ? (
          <Button
            size="small"
            type="primary"
            style={{ borderRadius: 980 }}
            onClick={async () => {
              try {
                await sellerApi.shipOrder(record.id)
                message.success('Order marked as shipped!')
                setOrders((prev) =>
                  prev.map((o) => o.id === record.id ? { ...o, status: 'SHIPPED' } : o)
                )
              } catch (err) { message.error(extractApiError(err)) }
            }}
          >
            Mark shipped
          </Button>
        ) : null,
    },
  ]

  return (
    <div style={styles.page}>
      {/* ── Shop header ── */}
      <div style={styles.shopHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Typography variant="h2Semibold" style={{ letterSpacing: '-0.02em' }}>
              {shop.name}
            </Typography>
            <Tag
              color={shop.status === 'ACTIVE' ? 'green' : 'orange'}
              style={{ borderRadius: 980, fontWeight: 500 }}
            >
              {shop.status}
            </Tag>
          </div>
          <Typography variant="bodyMedium" color="secondary">
            {shop.description ?? 'Your seller dashboard'}
          </Typography>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/seller/books/add')}
          style={styles.primaryBtn}
        >
          Add book
        </Button>
      </div>

      <div style={styles.container}>
        {/* ── KPI cards ── */}
        {/* TEACH: AntD Statistic inside a Card gives you a clean
            metric block. valueStyle overrides the number's color.
            prefix renders before the value (e.g. ₹ symbol). */}
        <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
          {[
            { title: 'Total books',    value: books.length,    icon: <BookOutlined />,     color: colors.primary },
            { title: 'Verified',       value: verifiedBooks,   icon: <CheckCircleOutlined />, color: '#34c759' },
            { title: 'Pending review', value: pendingBooks,    icon: <BookOutlined />,     color: '#ff9500' },
            { title: 'Revenue (last 5 orders)', value: totalRevenue, icon: <RiseOutlined />, color: colors.primary, prefix: '₹' },
          ].map(({ title, value, icon, color, prefix }) => (
            <Col key={title} xs={24} sm={12} lg={6}>
              <Card style={styles.kpiCard}>
                <div style={styles.kpiIcon(color)}>{icon}</div>
                <Statistic
                  title={<Typography variant="caption" color="secondary">{title}</Typography>}
                  value={value}
                  prefix={prefix}
                  valueStyle={{ color, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          {/* ── Recent books ── */}
          <Col xs={24} lg={14}>
            <Card
              title={<Typography variant="h5Regular">Recent books</Typography>}
              extra={
                <Button type="link" onClick={() => navigate('/seller/books/add')} style={{ padding: 0 }}>
                  + Add new
                </Button>
              }
              style={styles.tableCard}
            >
              {books.length === 0 ? (
                <Empty description="No books listed yet" />
              ) : (
                <Table
                  columns={bookColumns}
                  dataSource={books}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>

          {/* ── Recent orders ── */}
          <Col xs={24} lg={10}>
            <Card
              title={<Typography variant="h5Regular">Recent orders</Typography>}
              extra={
                <Button type="link" onClick={() => navigate('/seller/orders')} style={{ padding: 0 }}>
                  View all
                </Button>
              }
              style={styles.tableCard}
            >
              {orders.length === 0 ? (
                <Empty description="No orders yet" />
              ) : (
                <Table
                  columns={orderColumns}
                  dataSource={orders}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

// Helper for dynamic style (inline function returning style object)
// TEACH: When a style depends on a runtime value (color), you
// can use a function that returns a CSSProperties object.
// Can't do this cleanly with a static `styles` object.
const styles = {
  page:       { background: '#f5f5f7', minHeight: '100vh' } as React.CSSProperties,
  center:     { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  setupPage:  { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  setupCard:  { textAlign: 'center' as const, maxWidth: 480 },
  setupIcon:  { width: 88, height: 88, borderRadius: 24, background: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' } as React.CSSProperties,
  shopHeader: { background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } as React.CSSProperties,
  container:  { padding: '28px 32px 48px' } as React.CSSProperties,
  kpiCard:    { borderRadius: 16, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' } as React.CSSProperties,
  kpiIcon:    (color: string) => ({ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12, fontSize: 16 }),
  tableCard:  { borderRadius: 16, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' } as React.CSSProperties,
  primaryBtn: { borderRadius: 980, fontWeight: 500 } as React.CSSProperties,
  input:      { background: '#f5f5f7', border: '1px solid transparent', borderRadius: 12 } as React.CSSProperties,
}

export default SellerDashboard