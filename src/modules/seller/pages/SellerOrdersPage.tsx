// ─────────────────────────────────────────────────────────────
// SellerOrdersPage.tsx  (Part 7)
//
// TEACH — Inline action with optimistic update:
// When the seller clicks "Mark shipped", we:
//   1. Immediately update local state (optimistic — feels instant)
//   2. Call the API in the background
//   3. If API fails, rollback the local state
//
// This pattern is used by every fast-feeling UI (Gmail marking
// read, Notion ticking a checkbox). The user sees instant feedback
// without waiting for the network.
//
// TEACH — Table with expandable rows:
// AntD Table supports expandable rows via the `expandable` prop.
// When a row is expanded, it renders additional content below it.
// Perfect for showing order line items without a separate page.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { Table, Tag, Button, message, Space, Tooltip } from 'antd'
import { CarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { sellerApi } from '../api/seller.api'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { Order, OrderItem } from '@/types/api.types'

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'orange', CONFIRMED: 'blue', SHIPPED: 'geekblue',
  DELIVERED: 'green', CANCELLED: 'red', REFUNDED: 'purple',
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders]     = useState<Order[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [page, setPage]         = useState(1)
  const [shippingId, setShippingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await sellerApi.getOrders({ page, limit: 15 })
        setOrders(res.data.data.items)
        setTotal(res.data.data.total)
      } catch { /* handled globally */ }
      finally { setLoading(false) }
    }
    load()
  }, [page])

  const handleShip = async (order: Order) => {
    // Step 1: Optimistic update — change status locally first
    const prev = orders.map((o) => ({ ...o }))    // snapshot for rollback
    setOrders((prev) =>
      prev.map((o) => o.id === order.id ? { ...o, status: 'SHIPPED' } : o)
    )
    setShippingId(order.id)

    try {
      await sellerApi.shipOrder(order.id)
      message.success(`Order #${order.id.slice(0, 8).toUpperCase()} marked as shipped!`)
    } catch (err) {
      // Step 3: Rollback on failure
      setOrders(prev)
      message.error(extractApiError(err))
    } finally {
      setShippingId(null)
    }
  }

  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      width: 130,
      render: (id: string) => (
        <Typography variant="caption" style={{ fontFamily: 'monospace', color: colors.primary }}>
          #{id.slice(0, 8).toUpperCase()}
        </Typography>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'placedAt',
      render: (v: string) => (
        <Typography variant="bodySmall" color="secondary">{formatDate(v)}</Typography>
      ),
    },
    {
      title: 'Ship to',
      key: 'address',
      render: (_: unknown, r: Order) => (
        <Typography variant="bodySmall">{r.shippingCity}, {r.shippingState}</Typography>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      render: (items: OrderItem[]) => (
        // TEACH: Tooltip with a count hides the detail.
        // The expandable row shows the full list — no need to cram
        // book titles into a single cell.
        <Tooltip title="Click row to expand items">
          <Tag style={{ borderRadius: 980, cursor: 'pointer' }}>
            {items?.length ?? '?'} {(items?.length ?? 0) === 1 ? 'book' : 'books'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (v: number) => (
        <Typography variant="label">₹{v.toLocaleString('en-IN')}</Typography>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color={STATUS_COLOR[s] ?? 'default'} style={{ borderRadius: 980, fontWeight: 500 }}>
          {s}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Order) => (
        <Space size={4}>
          {record.status === 'CONFIRMED' && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              loading={shippingId === record.id}
              onClick={(e) => {
                e.stopPropagation()   // prevent row expansion
                handleShip(record)
              }}
              style={{ borderRadius: 980 }}
            >
              Ship
            </Button>
          )}
          {record.status === 'SHIPPED' && (
            <Tag color="geekblue" style={{ borderRadius: 980 }}>In transit</Tag>
          )}
          {record.status === 'DELIVERED' && (
            <Tag color="green" style={{ borderRadius: 980 }}>Delivered</Tag>
          )}
        </Space>
      ),
    },
  ]

  // TEACH: expandable.expandedRowRender receives the record and
  // renders below that row when expanded. We show the order items
  // as a Descriptions component — clean key-value layout.
  const expandable = {
    expandedRowRender: (record: Order) => (
      <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 8 }}>
        <Typography variant="label" style={{ marginBottom: 12, display: 'block' }}>
          Books in this order
        </Typography>
        {(record.items ?? []).map((item) => (
          <div key={item.id} style={styles.expandItem}>
            <div style={styles.expandDot} />
            <Typography variant="bodySmall" style={{ flex: 1 }}>
              {item.bookTitleSnapshot}
            </Typography>
            <Typography variant="caption" color="secondary">
              Qty {item.quantity}
            </Typography>
            <Typography variant="label" style={{ minWidth: 80, textAlign: 'right' }}>
              ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
            </Typography>
          </div>
        ))}
        <div style={{ ...styles.expandItem, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Typography variant="caption" color="secondary" style={{ flex: 1 }}>Ship to</Typography>
          <Typography variant="bodySmall">
            {record.shippingStreet}, {record.shippingCity} — {record.shippingPincode}
          </Typography>
        </div>
      </div>
    ),
    rowExpandable: () => true,
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Typography variant="h2Semibold" style={{ letterSpacing: '-0.02em' }}>
          Orders
        </Typography>
        <Typography variant="bodyMedium" color="secondary" style={{ marginTop: 4 }}>
          {total} total orders · Click a row to see the books inside
        </Typography>
      </div>

      <div style={styles.container}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          expandable={expandable}
          style={styles.table}
          pagination={{
            current:      page,
            pageSize:     15,
            total,
            onChange:     (p) => setPage(p),
            showSizeChanger: false,
            showTotal:    (t) => `${t} orders`,
          }}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:        { minHeight: '100vh', background: '#f5f5f7' },
  header:      { padding: '32px 32px 24px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 24 },
  container:   { padding: '0 32px 48px' },
  table:       { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  expandItem:  { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 },
  expandDot:   { width: 6, height: 6, borderRadius: '50%', background: colors.primary, flexShrink: 0 },
}

export default SellerOrdersPage