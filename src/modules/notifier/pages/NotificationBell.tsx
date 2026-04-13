// ─────────────────────────────────────────────────────────────
// NotificationBell.tsx  (Part 6)
//
// TEACH — AntD Badge:
// Badge wraps a child element and adds a count indicator.
// count={5} shows "5". count={0} hides the badge.
// overflowCount={99} shows "99+" for large numbers.
//
// TEACH — AntD Popover:
// Popover is like Tooltip but accepts rich ReactNode content.
// It's controlled (open/onOpenChange) so we can close it
// programmatically (e.g. after marking a notification read).
//
// TEACH — Polling for real-time data:
// True real-time needs WebSockets. For this app, we poll:
// every 30 seconds, fetch notifications. setInterval in useEffect
// with cleanup on unmount. Simple and effective for most apps.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import { Badge, Popover, Button, List, Spin } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { useNotifierStore } from '../store/notifierstore'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'

const POLL_INTERVAL = 30_000   // 30 seconds

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, loading, fetchAll, markRead } = useNotifierStore()

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, POLL_INTERVAL)
    // TEACH: The cleanup function runs when the component unmounts.
    // Without clearInterval here, the timer would keep firing even
    // after the user navigates away — a classic memory leak.
    return () => clearInterval(timer)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleMarkRead = async (id: string) => {
    await markRead(id)
  }

  const getIcon = (type: string): string => {
    const icons: Record<string, string> = {
      ORDER_PLACED:    '🛍️',
      ORDER_CONFIRMED: '✅',
      ORDER_SHIPPED:   '🚚',
      ORDER_DELIVERED: '📦',
      BOOK_VERIFIED:   '📗',
      BOOK_REJECTED:   '❌',
      SHOP_VERIFIED:   '🏪',
      SHOP_REJECTED:   '🚫',
    }
    return icons[type] ?? '🔔'
  }

  // Popover content — the notification list
  const popoverContent = (
    <div style={{ width: 340 }}>
      <div style={styles.popHeader}>
        <Typography variant="h5Regular">Notifications</Typography>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => useNotifierStore.getState().markAllRead()}
            style={{ color: colors.primary, fontSize: 12 }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div style={styles.center}><Spin size="small" /></div>
      ) : notifications.length === 0 ? (
        <div style={styles.center}>
          <Typography variant="bodySmall" color="secondary">No notifications yet</Typography>
        </div>
      ) : (
        // TEACH: AntD List with dataSource + renderItem is the
        // recommended way to render repeating list items.
        // It handles the key prop internally.
        <List
          dataSource={notifications.slice(0, 8)}  // show last 8
          renderItem={(n) => (
            <List.Item
              style={{
                ...styles.notifItem,
                background: n.isRead ? 'transparent' : colors.primaryLight,
              }}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div style={styles.notifInner}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{getIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="bodySmall" style={{ lineHeight: 1.4 }}>
                    {n.message ?? n.type.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ marginTop: 2, display: 'block' }}>
                    {new Date(n.createdAt).toLocaleDateString('en-IN')}
                  </Typography>
                </div>
                {!n.isRead && <div style={styles.unreadDot} />}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      styles={{ root: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
    >
      <Badge count={unreadCount} overflowCount={99} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={styles.bellBtn}
        />
      </Badge>
    </Popover>
  )
}

const styles: Record<string, React.CSSProperties> = {
  popHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' },
  center:     { padding: '24px 16px', textAlign: 'center' },
  notifItem:  { padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' },
  notifInner: { display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%' },
  unreadDot:  { width: 8, height: 8, borderRadius: '50%', background: colors.primary, flexShrink: 0, marginTop: 4 },
  bellBtn:    { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' },
}

export default NotificationBell