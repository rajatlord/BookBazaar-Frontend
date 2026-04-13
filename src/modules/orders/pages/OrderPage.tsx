// ─────────────────────────────────────────────────────────────
// OrdersPage.tsx  (Part 6)
//
// TEACH — AntD Table:
// Table is the most powerful AntD component. Key concepts:
//
//   columns[] — defines each column:
//     { title, dataIndex, key, render }
//     - dataIndex: which field from the data object to read
//     - render: (value, record) => ReactNode — full control
//       over what renders in that cell
//
//   dataSource[] — the actual data. Each item must have a
//     unique `key` (or you set rowKey on the Table itself)
//
//   loading — shows a built-in skeleton while fetching
//
// TEACH — useEffect cleanup:
// When a component unmounts while an async fetch is in flight,
// setting state on an unmounted component causes a warning.
// Solution: use an `isMounted` flag and check before set().
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from 'react'
import { Table, Tag, Button, Tooltip } from 'antd'
import { EyeOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { orderApi } from '../api/order.api'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { Order } from '@/types/api.types'

// ── Helpers ────────────────────────────────────────────────
function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:   'orange',
    CONFIRMED: 'blue',
    SHIPPED:   'geekblue',
    DELIVERED: 'green',
    CANCELLED: 'red',
    REFUNDED:  'purple',
  }
  return map[status] ?? 'default'
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders]   = useState<Order[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage]       = useState(1)
  const navigate              = useNavigate()

  // TEACH: useRef for isMounted pattern.
  // useRef creates a mutable box whose .current survives re-renders
  // but does NOT trigger re-renders when it changes. Perfect for
  // flags, timers, and DOM refs.
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }   // runs on unmount
  }, [])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await orderApi.getAll({ page, limit: 10 })
        // Guard: only set state if component is still mounted
        if (isMounted.current) {
          setOrders(res.data.data.items)
          setTotal(res.data.data.total)
        }
      } catch { /* handled globally by interceptor */ }
      finally {
        if (isMounted.current) setLoading(false)
      }
    }
    fetch()
  }, [page])

  // ── Column definitions ───────────────────────────────────
  // TEACH: ColumnsType<T> is AntD's TypeScript generic for columns.
  // Providing the type gives you autocomplete on `record` inside render.
  const columns: ColumnsType<Order> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      // render receives (cellValue, fullRecord) — use fullRecord
      // to access sibling fields.
      render: (id: string) => (
        <Typography variant="caption" style={{ fontFamily: 'monospace', color: colors.primary }}>
          #{id.slice(0, 8).toUpperCase()}
        </Typography>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'placedAt',
      key: 'placedAt',
      render: (v: string) => (
        <Typography variant="bodySmall" color="secondary">{formatDate(v)}</Typography>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (_, record: Order) => (
        // TEACH: Tooltip wraps any element and shows a label on hover.
        // We use it to show book titles without cluttering the table.
        <Tooltip
          title={record.items.map((i) => i.bookTitleSnapshot).join(', ')}
          placement="top"
        >
          <Typography variant="bodySmall">
            {record.items.length} {record.items.length === 1 ? 'book' : 'books'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => (
        <Typography variant="label">
          ₹{v.toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment',
      key: 'payment',
      render: (_, record: Order) => (
        <Typography variant="caption" color="secondary">
          {record.payment?.method?.replace('_', ' ') ?? '—'}
        </Typography>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ borderRadius: 980, fontWeight: 500 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record: Order) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
          style={{ color: colors.primary }}
        />
      ),
    },
  ]

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingOutlined style={{ fontSize: 24, color: colors.primary }} />
            <div>
              <Typography variant="h2Semibold" style={styles.heading}>My orders</Typography>
              <Typography variant="bodySmall" color="secondary">
                {total} order{total !== 1 ? 's' : ''} placed
              </Typography>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/books')}
            style={{ borderRadius: 980 }}
          >
            Shop more books
          </Button>
        </div>
      </div>

      <div style={styles.container}>
        {orders.length === 0 && !loading ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>📦</span>
            <Typography variant="h4Semibold" style={{ marginTop: 16 }}>No orders yet</Typography>
            <Typography variant="bodyMedium" color="secondary" style={{ marginTop: 8 }}>
              Your order history will appear here after your first purchase
            </Typography>
            <Button
              type="primary"
              onClick={() => navigate('/books')}
              style={{ marginTop: 24, borderRadius: 980 }}
            >
              Browse books
            </Button>
          </div>
        ) : (
          // TEACH: Table pagination — we control it with `pagination`
          // prop. onChange fires with (page, pageSize).
          // We only use page here since pageSize is fixed at 10.
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            style={styles.table}
            pagination={{
              current:      page,
              pageSize:     10,
              total,
              onChange:     (p) => setPage(p),
              showTotal:    (t) => `${t} orders`,
              showSizeChanger: false,
            }}
            // TEACH: onRow returns event handlers for each row.
            // Combined with the EyeOutlined button, users can click
            // either the button OR the row to navigate.
            onRow={(record) => ({
              onClick:       () => navigate(`/orders/${record.id}`),
              style:         { cursor: 'pointer' },
            })}
          />
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:       { minHeight: '100vh', background: '#f5f5f7' },
  header:     { background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '40px 0 28px', marginBottom: 32 },
  headerInner:{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heading:    { marginBottom: 2, letterSpacing: '-0.02em' },
  container:  { maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' },
  table:      { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' },
}

export default OrdersPage