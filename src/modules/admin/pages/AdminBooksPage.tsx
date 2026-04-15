// ─────────────────────────────────────────────────────────────
// AdminBooksPage.tsx  (Part 8)
//
// TEACH — Modal with dynamic content:
// We use ONE modal for both Approve and Reject, controlled by
// an `action` state variable. The modal title, button text, and
// form fields change based on `action`. This is "controlled modal"
// — cleaner than two separate modals.
//
// TEACH — Removing items from local state after action:
// After approving/rejecting a book, it should disappear from
// the "pending" list. We filter it out of local state immediately
// — no re-fetch. This is faster and feels more responsive.
// The list shrinks in real time as the admin works through it.
//
// TEACH — Empty state with context:
// When the pending list is empty, show a positive message —
// "All caught up!" — not just "No data". Context-aware empty
// states feel more intentional than generic placeholders.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import {
  Card, Button, Modal, Input, message,
  Spin, Row, Col, Divider, Badge,
} from 'antd'
import {
  CheckOutlined, CloseOutlined, BookOutlined,
  ShopOutlined, CalendarOutlined,
} from '@ant-design/icons'
import { adminApi } from '../api/admin.api'
import { extractApiError } from '@/api/axiosClient'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { PendingBook } from '@/types/api.types'

type ActionType = 'APPROVE' | 'REJECT' | null

const AdminBooksPage: React.FC = () => {
  const [books, setBooks]         = useState<PendingBook[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)

  // Modal state
  const [selectedBook, setSelectedBook] = useState<PendingBook | null>(null)
  const [action, setAction]             = useState<ActionType>(null)
  const [reason, setReason]             = useState('')
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await adminApi.getPendingBooks({ page, limit: 12 })
        setBooks(res.data.data.data ?? []) 
        setTotal(res.data.data.total ?? 0)
      } catch { /* handled globally */ }
      finally { setLoading(false) }
    }
    load()  
  }, [page])

  // const openModal = (book: Book, act: ActionType) => {
  //   setSelectedBook(book)
  //   setAction(act)
  //   setReason('')
  // }
  const openModal = (book: PendingBook, act: ActionType) => {
    setSelectedBook(book)
    setAction(act)
    setReason('')
  }

  const closeModal = () => {
    setSelectedBook(null)
    setAction(null)
    setReason('')
  }

  const handleVerify = async () => {
    if (!selectedBook || !action) return
    setSubmitting(true)
    try {
      await adminApi.verifyBook(
        selectedBook.bookId,
        action,
        action === 'REJECT' ? reason : undefined
      )
      // Remove the book from local state immediately
      // TEACH: filter() creates a new array without the processed item.
      // The admin sees it disappear — instant visual feedback.
      setBooks((prev) => prev.filter((b) => b.bookId !== selectedBook.bookId))
      setTotal((t) => t - 1)
      message.success(
        action === 'APPROVE'
          ? `"${selectedBook.title}" is now live!`
          : `"${selectedBook.title}" has been rejected`
      )
      closeModal()
    } catch (err) {
      message.error(extractApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const GENRE_COLORS: Record<string, string> = {
    Programming: '#0071e3', Fiction: '#5856d6', Science: '#34c759',
    History: '#ff9500', Philosophy: '#af52de', Business: '#ff3b30',
    Biography: '#30b0c7',
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOutlined style={{ fontSize: 22, color: colors.primary }} />
          <div>
            <Typography variant="h2Semibold" style={{ letterSpacing: '-0.02em' }}>
              Pending books
            </Typography>
            <Typography variant="bodySmall" color="secondary" style={{ marginTop: 2 }}>
              {total} book{total !== 1 ? 's' : ''} awaiting verification
            </Typography>
          </div>
          {total > 0 && (
            <Badge
              count={total}
              style={{ background: '#ff9500', marginLeft: 4 }}
              overflowCount={99}
            />
          )}
        </div>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={styles.center}><Spin size="large" /></div>
        ) : books.length === 0 ? (
          // TEACH: Context-aware empty state
          <div style={styles.center}>
            <div style={styles.allClearIcon}>
              <CheckOutlined style={{ fontSize: 32, color: '#34c759' }} />
            </div>
            <Typography variant="h3Regular" style={{ marginTop: 20, marginBottom: 8 }}>
              All caught up!
            </Typography>
            <Typography variant="bodyMedium" color="secondary">
              No books pending review right now. Check back later.
            </Typography>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {books.map((book) => (
              <Col key={book.id} xs={24} sm={12} lg={8}>
                <Card style={styles.bookCard}>
                  {/* Color strip header */}
                  <div
                    style={{
                      ...styles.bookStrip,
                      background: book.genre
                        ? (GENRE_COLORS[book.genre] ?? '#636366')
                        : '#636366',
                    }}
                  >
                    <Typography
                      variant="h5Regular"
                      style={{ color: '#fff', textAlign: 'center', lineHeight: 1.3 }}
                    >
                      {book.title.length > 44 ? book.title.slice(0, 44) + '…' : book.title}
                    </Typography>
                    {book.genre && (
                      <span style={styles.genrePill}>{book.genre}</span>
                    )}
                  </div>

                  <div style={{ padding: '16px 16px 12px' }}>
                    {/* Meta */}
                    <div style={styles.metaRow}>
                      <BookOutlined style={{ color: colors.textTertiary, fontSize: 12 }} />
                      <Typography variant="bodySmall" color="secondary">
                        by {book.author}
                      </Typography>
                    </div>
                    <div style={styles.metaRow}>
                      <ShopOutlined style={{ color: colors.textTertiary, fontSize: 12 }} />
                      <Typography variant="bodySmall" color="secondary">
                        {book.shopName ?? 'Unknown shop'}
                      </Typography>
                    </div>
                    <div style={styles.metaRow}>
                      <CalendarOutlined style={{ color: colors.textTertiary, fontSize: 12 }} />
                      <Typography variant="bodySmall" color="secondary">
                        ISBN: {book.isbn}
                      </Typography>
                    </div>

                    <Divider style={{ margin: '12px 0' }} />

                    <div style={styles.priceRow}>
                      <Typography variant="h4Semibold" style={{ color: colors.textPrimary }}>
                        ₹{book.price.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        Stock: {book.availableStock}
                      </Typography>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.actions}>
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => openModal(book, 'REJECT')}
                        style={styles.rejectBtn}
                      >
                        Reject
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => openModal(book, 'APPROVE')}
                        style={styles.approveBtn}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Load more */}
        {books.length > 0 && total > books.length && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Button onClick={() => setPage((p) => p + 1)} style={{ borderRadius: 980 }}>
              Load more
            </Button>
          </div>
        )}
      </div>

      {/* ── Approve / Reject modal ── */}
      {/* TEACH: One controlled modal handles both actions.
          The content changes based on `action` state. */}
      <Modal
        open={!!selectedBook && !!action}
        onCancel={closeModal}
        onOk={handleVerify}
        okText={action === 'APPROVE' ? 'Approve book' : 'Reject book'}
        okButtonProps={{
          danger:  action === 'REJECT',
          loading: submitting,
          style:   { borderRadius: 980 },
          disabled: action === 'REJECT' && !reason.trim(),
        }}
        cancelButtonProps={{ style: { borderRadius: 980 } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {action === 'APPROVE'
              ? <CheckOutlined style={{ color: '#34c759' }} />
              : <CloseOutlined style={{ color: colors.danger }} />}
            <Typography variant="h4Semibold">
              {action === 'APPROVE' ? 'Approve book' : 'Reject book'}
            </Typography>
          </div>
        }
      >
        {selectedBook && (
          <div style={{ marginTop: 12 }}>
            <div style={{ background: '#f5f5f7', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
              <Typography variant="label">{selectedBook.title}</Typography>
              <Typography variant="caption" color="secondary" style={{ display: 'block', marginTop: 2 }}>
                by {selectedBook.author} · ₹{selectedBook.price.toLocaleString('en-IN')}
              </Typography>
            </div>

            {action === 'APPROVE' ? (
              <Typography variant="bodyMedium" color="secondary">
                This book will go live and appear in search results immediately.
              </Typography>
            ) : (
              <>
                <Typography variant="bodySmall" color="secondary" style={{ marginBottom: 10 }}>
                  Provide a reason — the seller will be notified.
                </Typography>
                {/* TEACH: Input.TextArea is uncontrolled here (we use
                    local `reason` state, not a Form). This is fine for
                    simple single-input modals. Only use Form when you
                    need validation across multiple fields. */}
                <Input.TextArea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Duplicate ISBN already in system, incorrect author info…"
                  style={{ background: '#f5f5f7', border: 'none', borderRadius: 10 }}
                />
                {!reason.trim() && (
                  <Typography variant="caption" style={{ color: colors.danger, marginTop: 6, display: 'block' }}>
                    Reason is required for rejection
                  </Typography>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page:       { minHeight: '100vh', background: '#f5f5f7' },
  header:     { background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '32px 32px 24px', marginBottom: 24 },
  container:  { padding: '0 32px 48px' },
  center:     { minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  allClearIcon: { width: 72, height: 72, borderRadius: '50%', background: '#e8faf0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bookCard:   { borderRadius: 16, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden', padding: 0 },
  bookStrip:  { padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' },
  genrePill:  { background: 'rgba(255,255,255,0.2)', borderRadius: 980, padding: '2px 10px', fontSize: 11, color: '#fff', fontWeight: 500 },
  metaRow:    { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 },
  priceRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  actions:    { display: 'flex', gap: 8 },
  rejectBtn:  { flex: 1, borderRadius: 980, fontWeight: 500 },
  approveBtn: { flex: 1, borderRadius: 980, fontWeight: 500, background: '#34c759', borderColor: '#34c759' },
}

export default AdminBooksPage