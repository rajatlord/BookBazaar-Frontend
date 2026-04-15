// ─────────────────────────────────────────────────────────────
// AddBookPage.tsx  (Part 7)
//
// TEACH — Form.Item with InputNumber:
// InputNumber handles numeric input with min/max/precision.
// Inside a Form.Item, AntD wires it automatically — you get
// the number value (not a string) in onFinish. No parseInt needed.
//
// TEACH — Form layout with grid:
// AntD Form supports labelCol and wrapperCol to create label/
// input alignment, OR you can use layout="vertical" with
// manual CSS grid for multi-column forms. We use the latter —
// more flexible and matches Apple's clean two-column layout.
//
// TEACH — Navigating after success:
// After a successful API call, navigate the user to a relevant
// page. navigate(-1) goes back to the previous page. This is
// better UX than hardcoding '/seller' because the user might
// have come from anywhere.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import {
  Form, Input, InputNumber, Select, Button,
  message, Card, Divider, Alert,
} from 'antd'
import { ArrowLeftOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { sellerApi } from '../api/seller.api'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'

const GENRES = [
  'Programming', 'Fiction', 'Science', 'History',
  'Philosophy', 'Business', 'Biography', 'Self-Help',
  'Children', 'Comics', 'Poetry', 'Other',
]

interface AddBookFormValues {
  title:       string
  author:      string
  isbn:        string
  price:       number
  stockCount:  number
  genre:       string
  description: string
}

const AddBookPage: React.FC = () => {
  const [form] = Form.useForm<AddBookFormValues>()
  const [loading, setLoading] = useState(false)

  // Live preview — reads form fields as user types
  // TEACH: Form.useWatch on multiple fields returns their current values.
  // We use these to show a live book card preview on the right.
  const title  = Form.useWatch('title',  form)
  const author = Form.useWatch('author', form)
  const price  = Form.useWatch('price',  form)
  const genre  = Form.useWatch('genre',  form)

  const navigate = useNavigate()

  const handleSubmit = async (values: AddBookFormValues) => {
    setLoading(true)
    try {
      const res = await sellerApi.createBook(values)
      message.success(`"${res.data.data.title}" listed! It'll be reviewed shortly.`)
      // TEACH: navigate(-1) = "go back". Better than hardcoding
      // '/seller' because the user's history is preserved.
      navigate(-1)
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Color for preview card
  const GENRE_COLORS: Record<string, string> = {
    Programming: '#0071e3', Fiction: '#5856d6', Science: '#34c759',
    History: '#ff9500', Philosophy: '#af52de', Business: '#ff3b30',
    Biography: '#30b0c7', Other: '#636366',
  }
  const previewColor = genre ? (GENRE_COLORS[genre] ?? '#636366') : '#e5e5ea'

  return (
    <div style={styles.page}>
      {/* ── Page header ── */}
      <div style={styles.header}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: colors.primary, padding: 0, marginBottom: 8 }}
        >
          Back to dashboard
        </Button>
        <Typography variant="h2Semibold" style={{ letterSpacing: '-0.02em' }}>
          List a new book
        </Typography>
        <Typography variant="bodyMedium" color="secondary" style={{ marginTop: 4 }}>
          Your book will be reviewed by our team before going live
        </Typography>
      </div>

      <div style={styles.layout}>
        {/* ── Form ── */}
        <div style={{ flex: 1 }}>
          <Card style={styles.formCard}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              {/* TEACH: Two-column layout inside a form using CSS grid.
                  AntD Form.Item wraps normally — the grid container
                  is just a div, not an AntD component. */}
              <div style={styles.twoCol}>
                <Form.Item
                  name="title"
                  label={<span style={styles.label}>Book title</span>}
                  rules={[{ required: true, message: 'Title is required' }]}
                >
                  <Input
                    size="large"
                    placeholder="Clean Code"
                    style={styles.input}
                    prefix={<BookOutlined style={{ color: colors.textTertiary }} />}
                  />
                </Form.Item>

                <Form.Item
                  name="author"
                  label={<span style={styles.label}>Author</span>}
                  rules={[{ required: true, message: 'Author is required' }]}
                >
                  <Input size="large" placeholder="Robert C. Martin" style={styles.input} />
                </Form.Item>
              </div>

              <div style={styles.twoCol}>
                <Form.Item
                  name="isbn"
                  label={<span style={styles.label}>ISBN</span>}
                  rules={[
                    { required: true, message: 'ISBN is required' },
                    { pattern: /^[0-9-]{10,17}$/, message: 'Enter a valid ISBN' },
                  ]}
                >
                  <Input size="large" placeholder="978-0132350884" style={styles.input} />
                </Form.Item>

                <Form.Item
                  name="genre"
                  label={<span style={styles.label}>Genre</span>}
                  rules={[{ required: true, message: 'Genre is required' }]}
                >
                  <Select
                    size="large"
                    placeholder="Select genre"
                    style={{ background: '#f5f5f7' }}
                    options={GENRES.map((g) => ({ value: g, label: g }))}
                  />
                </Form.Item>
              </div>

              <div style={styles.twoCol}>
                <Form.Item
                  name="price"
                  label={<span style={styles.label}>Price (₹)</span>}
                  rules={[
                    { required: true, message: 'Price is required' },
                    { type: 'number', min: 1, message: 'Must be at least ₹1' },
                  ]}
                >
                  {/* TEACH: InputNumber with formatter/parser.
                      formatter adds the ₹ symbol for display.
                      parser strips it back to a plain number.
                      The form receives a number, not "₹499". */}
                  <InputNumber
                    size="large"
                    style={{ width: '100%', background: '#f5f5f7', borderRadius: 12 }}
                    placeholder="499"
                    min={1}
                    max={100000}
                    formatter={(v) => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(v) => Number(v!.replace(/₹\s?|(,*)/g, '')) as 1 | 100000}
                  />
                </Form.Item>

                <Form.Item
                  name="stockCount"
                  label={<span style={styles.label}>Stock quantity</span>}
                  rules={[
                    { required: true, message: 'Stock is required' },
                    { type: 'number', min: 1, message: 'At least 1 copy' },
                  ]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%', background: '#f5f5f7', borderRadius: 12 }}
                    placeholder="50"
                    min={1}
                    max={10000}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="description"
                label={<span style={styles.label}>Description</span>}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="A short description of the book for buyers…"
                  style={{ background: '#f5f5f7', border: '1px solid transparent', borderRadius: 12 }}
                />
              </Form.Item>

              <Divider />

              <Alert
                type="info"
                showIcon
                message="Review process"
                description="After listing, our team reviews the book within 24 hours. Once verified it appears in search results."
                style={{ marginBottom: 24, borderRadius: 12 }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  onClick={() => navigate(-1)}
                  size="large"
                  style={{ borderRadius: 980, flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  style={{ ...styles.primaryBtn, flex: 2 }}
                >
                  Submit for review
                </Button>
              </div>
            </Form>
          </Card>
        </div>

        {/* ── Live preview ── */}
        <div style={styles.previewCol}>
          <Typography variant="label" color="secondary" style={{ marginBottom: 12, display: 'block' }}>
            Live preview
          </Typography>
          <div style={{ ...styles.previewCard, background: previewColor }}>
            <Typography
              variant="h4Semibold"
              style={{ color: '#fff', textAlign: 'center', letterSpacing: '-0.01em', lineHeight: 1.3 }}
            >
              {title || 'Book title'}
            </Typography>
            <Typography
              variant="bodySmall"
              style={{ color: 'rgba(255,255,255,0.75)', marginTop: 10, textAlign: 'center' }}
            >
              {author || 'Author name'}
            </Typography>
            {genre && (
              <div style={styles.genrePill}>
                <Typography variant="caption" style={{ color: '#fff', fontWeight: 500 }}>{genre}</Typography>
              </div>
            )}
          </div>
          <div style={styles.previewMeta}>
            <Typography variant="h4Semibold" style={{ color: colors.primary }}>
              {price ? `₹${Number(price).toLocaleString('en-IN')}` : '—'}
            </Typography>
            <Typography variant="caption" color="secondary" style={{ marginTop: 2 }}>
              Pending verification after submit
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:       { minHeight: '100vh', background: '#f5f5f7', paddingBottom: 60 },
  header:     { padding: '32px 32px 0', marginBottom: 24 },
  layout:     { display: 'flex', gap: 24, padding: '0 32px', alignItems: 'flex-start' },
  formCard:   { borderRadius: 20, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1 },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label:      { fontSize: 13, fontWeight: 500, color: '#1d1d1f' },
  input:      { background: '#f5f5f7', border: '1px solid transparent', borderRadius: 12 },
  primaryBtn: { borderRadius: 980, fontWeight: 500 },
  previewCol: { width: 240, flexShrink: 0 },
  previewCard:{
    borderRadius: 20, padding: '40px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'background 0.3s', minHeight: 200,
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
  genrePill:  { marginTop: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 980, padding: '3px 12px' },
  previewMeta:{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginTop: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
}

export default AddBookPage