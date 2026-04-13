// ─────────────────────────────────────────────────────────────
// LoginPage.tsx  (Part 3)
//
// TEACH — AntD Form system:
// AntD Form is a controlled form manager. You never write
// onChange handlers manually. Instead:
//   <Form.Item name="email" rules={[...]}>
//     <Input />
//   </Form.Item>
// AntD wires the Input to the form instance automatically.
// form.getFieldsValue() gives you all values at once.
// rules[] handles validation — no separate Yup/Zod needed.
//
// TEACH — useNavigate:
// React Router's hook for programmatic navigation.
// navigate('/books') = push to history stack (back button works)
// navigate('/books', { replace: true }) = replace (no back)
// After login we REPLACE so the user can't go "back to login".
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { Form, Input, Button, Divider, message } from 'antd'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/authStore'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { ROUTES } from '@/config/constants'
import { colors } from '@/theme/colors'

interface LoginFormValues {
  email: string
  password: string
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm<LoginFormValues>()
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      const { user, token } = res.data.data

      // TEACH: setAuth writes to Zustand store. Every component
      // subscribed to useAuthStore will re-render automatically.
      // No prop drilling, no Context.Provider needed.
      setAuth(user, token)

      message.success(`Welcome back, ${user.name.split(' ')[0]}!`)

      // TEACH: Role-based redirect after login.
      // Each role lands on their home page, not a generic '/'.
      const roleHome: Record<string, string> = {
        BUYER:  ROUTES.BOOKS,
        SELLER: ROUTES.SELLER,
        ADMIN:  ROUTES.ADMIN_BOOKS,
      }
      navigate(roleHome[user.role] ?? ROUTES.BOOKS, { replace: true })
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* ── Left panel — branding ── */}
      <div style={styles.leftPanel}>
        <div style={styles.brandMark}>
          <span style={styles.brandIcon}>📚</span>
        </div>
        <Typography variant="h1Bold" style={styles.brandTitle}>
          BookBazaar
        </Typography>
        <Typography variant="bodyLarge" color="secondary" style={styles.brandSub}>
          India's finest independent bookstore marketplace.
          Discover, collect, and read.
        </Typography>
        <div style={styles.statsRow}>
          {[['50K+', 'Books'], ['12K+', 'Sellers'], ['2M+', 'Readers']].map(([num, label]) => (
            <div key={label} style={styles.stat}>
              <Typography variant="h3Regular" style={{ color: colors.primary }}>{num}</Typography>
              <Typography variant="caption" color="secondary">{label}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <Typography variant="h2Semibold" style={{ marginBottom: 6 }}>
            Sign in
          </Typography>
          <Typography variant="bodyMedium" color="secondary" style={{ marginBottom: 32 }}>
            New to BookBazaar?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: colors.primary }}>
              Create an account
            </Link>
          </Typography>

          {/* ── TEACH: Form component ──────────────────────────
            layout="vertical" stacks label above input.
            onFinish fires ONLY when all rules pass — you never
            see invalid data inside handleSubmit.
            initialValues pre-fills fields (great for dev).
          ────────────────────────────────────────────────── */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span style={styles.label}>Email</span>}
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input
                size="large"
                placeholder="you@example.com"
                style={styles.input}
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={styles.label}>Password</span>}
              rules={[{ required: true, message: 'Password is required' }]}
              style={{ marginBottom: 24 }}
            >
              {/* TEACH: Input.Password renders a show/hide toggle
                  automatically. No extra state needed. */}
              <Input.Password
                size="large"
                placeholder="Your password"
                style={styles.input}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={styles.submitBtn}
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>

          <Divider style={styles.divider}>
            <Typography variant="caption" color="secondary">or</Typography>
          </Divider>

          <Typography variant="caption" color="secondary" style={{ textAlign: 'center', display: 'block' }}>
            By signing in you agree to our Terms of Service
          </Typography>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TEACH — Styles object pattern (no stylesheet file):
// We write styles as a plain object and reference with
// style={styles.xxx}. This keeps styles co-located with the
// component they serve. AntD's theme tokens still apply to
// AntD components — these styles only affect our layout divs.
//
// For values that depend on tokens (colors, radii), we import
// from @/theme/colors.ts instead of hardcoding hex strings.
// ─────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#f5f5f7',
  },
  leftPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '80px 64px',
    background: '#fff',
    borderRight: '1px solid rgba(0,0,0,0.06)',
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: colors.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  brandIcon: { fontSize: 32 },
  brandTitle: {
    marginBottom: 16,
    letterSpacing: '-0.03em',
  },
  brandSub: {
    maxWidth: 360,
    marginBottom: 48,
  },
  statsRow: {
    display: 'flex',
    gap: 48,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 24,
    padding: 40,
    boxShadow: '0 2px 20px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.06)',
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1d1d1f',
  },
  input: {
    background: '#f5f5f7',
    border: '1px solid transparent',
    borderRadius: 12,
    height: 44,
  },
  submitBtn: {
    height: 48,
    borderRadius: 980,
    fontSize: 15,
    fontWeight: 500,
    background: colors.primary,
  },
  divider: {
    margin: '20px 0',
  },
}

export default LoginPage