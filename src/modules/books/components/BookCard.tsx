// ─────────────────────────────────────────────────────────────
// BookCard.tsx  (Part 4)
//
// TEACH — Component design principles:
//
// 1. Single responsibility: BookCard ONLY renders one book.
//    It does NOT fetch data, does NOT manage cart state.
//    Data flows IN via props. Events flow OUT via callbacks.
//
// 2. "Dumb" vs "Smart" components:
//    Dumb (this file): receives props, renders UI, fires callbacks.
//    Smart (BooksPage): owns state, fetches data, passes to dumb.
//
// 3. React.memo(): wraps the component to prevent re-render
//    if props haven't changed. The grid renders 12 cards — without
//    memo, one parent state change re-renders all 12. With memo,
//    only changed cards re-render.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { Card, Badge, Button, Rate } from 'antd'
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Typography } from '@/theme/AppTypography'
import { colors } from '@/theme/colors'
import type { Book } from '@/types/api.types'

interface BookCardProps {
  book: Book
  onAddToCart?: (bookId: string) => void
  cartLoading?: boolean
}

// TEACH: React.memo is a HOC that memoizes the component.
// It does a shallow comparison of props. If book, onAddToCart,
// and cartLoading are all the same reference → skip re-render.
const BookCard: React.FC<BookCardProps> = React.memo(({ book, onAddToCart, cartLoading }) => {
  const navigate = useNavigate()
  const isOutOfStock = book.stockCount === 0

  const handleCardClick = () => {
    navigate(`/books/${book.id}`)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    // TEACH: stopPropagation() prevents the card click from also
    // firing when the button is clicked. Without this, clicking
    // "Add to cart" would ALSO navigate to the book detail page.
    e.stopPropagation()
    onAddToCart?.(book.id)
  }

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      style={styles.card}
      // TEACH: AntD Card's cover prop renders content above the
      // card body. We use it for the book color block (no real
      // images in this project — your backend doesn't have them).
      cover={
        <div style={{ ...styles.cover, background: getBookColor(book.genre) }}>
          <div style={styles.coverInner}>
            <Typography
              variant="h5Regular"
              style={{ color: '#fff', textAlign: 'center', letterSpacing: '-0.01em', lineHeight: 1.3 }}
            >
              {book.title}
            </Typography>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
              {book.author}
            </Typography>
          </div>
          {/* Genre badge */}
          {book.genre && (
            <div style={styles.genreBadge}>
              <Typography variant="caption" style={{ color: '#fff', fontWeight: 500 }}>
                {book.genre}
              </Typography>
            </div>
          )}
        </div>
      }
      // TEACH: bodyStyle controls the Card's body padding.
      // We override it to get tighter control than the AntD default.
      styles={{ body: { padding: '16px' } }}
    >
      {/* Title + author */}
      <div style={{ marginBottom: 8 }}>
        <Typography
          variant="h5Regular"
          style={{ color: colors.textPrimary, marginBottom: 2, letterSpacing: '-0.01em' }}
        >
          {book.title.length > 40 ? book.title.slice(0, 40) + '…' : book.title}
        </Typography>
        <Typography variant="caption" color="secondary">
          by {book.author}
        </Typography>
      </div>

      {/* Placeholder stars (no rating data in basic Book DTO) */}
      <Rate disabled defaultValue={4} style={{ fontSize: 12, marginBottom: 10 }} />

      {/* Price row */}
      <div style={styles.priceRow}>
        <Typography variant="h4Semibold" style={{ color: colors.textPrimary }}>
          ₹{book.price.toLocaleString('en-IN')}
        </Typography>

        {/* TEACH: AntD Badge.Ribbon wraps its children and adds a
            ribbon label. We use it to flag out-of-stock books.
            Conditional rendering: show ribbon only when needed. */}
        {isOutOfStock ? (
          <Badge status="error" text={
            <Typography variant="caption" style={{ color: colors.danger }}>Out of stock</Typography>
          } />
        ) : (
          <Typography variant="caption" style={{ color: colors.success }}>
            {book.stockCount} left
          </Typography>
        )}
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <Button
          icon={<EyeOutlined />}
          style={styles.viewBtn}
          onClick={handleCardClick}
          size="small"
        >
          Details
        </Button>
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={isOutOfStock || !onAddToCart}
          loading={cartLoading}
          onClick={handleAddToCart}
          size="small"
          style={styles.cartBtn}
        >
          Add
        </Button>
      </div>
    </Card>
  )
})

// TEACH: displayName is required when you wrap a component with
// React.memo — otherwise React DevTools shows "Anonymous".
BookCard.displayName = 'BookCard'

// Maps genre → a distinct color. No images needed.
function getBookColor(genre?: string): string {
  const map: Record<string, string> = {
    Programming:   '#0071e3',
    Fiction:       '#5856d6',
    Science:       '#34c759',
    History:       '#ff9500',
    Philosophy:    '#af52de',
    Business:      '#ff3b30',
    Biography:     '#30b0c7',
    Default:       '#636366',
  }
  return genre ? (map[genre] ?? map.Default) : map.Default
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 16,
    border: 'none',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cover: {
    height: 180,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '20px 16px',
  },
  coverInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  genreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(0,0,0,0.25)',
    borderRadius: 980,
    padding: '2px 10px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    borderRadius: 980,
    fontSize: 12,
    height: 32,
    background: '#f5f5f7',
    border: 'none',
    color: '#1d1d1f',
  },
  cartBtn: {
    flex: 1,
    borderRadius: 980,
    fontSize: 12,
    height: 32,
  },
}

export default BookCard