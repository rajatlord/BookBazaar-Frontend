import { List, Button as AntBtn } from 'antd';
import { useNotifierStore } from '@/modules/notifier/store/notifierstore';
import React, { useEffect} from 'react';
import { Typography } from '@/theme/AppTypography';
import { colors } from '@/theme/colors';

export const NotificationsPage: React.FC = () => {
  const { notifications, loading, fetchAll, markRead } = useNotifierStore()
 
  useEffect(() => { fetchAll() }, [])  // eslint-disable-line
 
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <Typography variant="h2Semibold" style={{ marginBottom: 24, letterSpacing: '-0.02em' }}>Notifications</Typography>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <List
          loading={loading}
          dataSource={notifications}
          locale={{ emptyText: 'No notifications yet' }}
          renderItem={(n) => (
            <List.Item
              style={{ padding: '16px 20px', background: n.isRead ? 'transparent' : colors.primaryLight, cursor: n.isRead ? 'default' : 'pointer', transition: 'background 0.15s' }}
              onClick={() => !n.isRead && markRead(n.id)}
              extra={!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.primary }} />}
            >
              <List.Item.Meta
                title={<Typography variant="label">{n.type.replace(/_/g, ' ')}</Typography>}
                description={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                    <Typography variant="caption" color="secondary">{n.message ?? '—'}</Typography>
                    <Typography variant="caption" color="secondary">· {new Date(n.createdAt).toLocaleDateString('en-IN')}</Typography>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}
 
export default NotificationsPage;