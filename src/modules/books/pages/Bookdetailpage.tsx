// ─────────────────────────────────────────────────────────────
// BookDetailPage.tsx  (Part 4)
//
// TEACH — useParams:
// React Router stores URL parameters in the params object.
// For the route /books/:id, useParams() returns { id: "abc-123" }.
// No need to parse the URL manually.
//
// TEACH — AntD Tabs:
// Tabs manages which panel is active. The items array declaratively
// defines all tabs — no conditional rendering in JSX needed.
// AntD mounts all tab content but hides inactive ones, which
// means data in inactive tabs is still fetched. For heavy tabs
// use destroyInactiveTabPane={true} to lazy-mount instead.
//
// TEACH — Conditional rendering patterns:
//   {loading && <Spin />}              → show only while loading
//   {!loading && book && <Content />}  → show only when ready
//   {book?.stockCount === 0 && ...}    → optional chaining
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tabs,
  Rate,
  Tag,
  Spin,
  message,
  Breadcrumb,
  InputNumber,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { bookApi } from "../api/book.api";
import { reviewApi } from "@/modules/review/api/review.api";
import { cartApi } from "@/modules/cart/api/cart.api";
import { useCartStore } from "@/modules/cart/store/CartStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { extractApiError } from "@/api/axiosClient";
import { Typography } from "@/theme/AppTypography";
import { colors } from "@/theme/colors";
import type { Book, Review } from "@/types/api.types";
import { getBookStatusColor } from "@/utils";

const BookDetailPage: React.FC = () => {
  // TEACH: useParams — extracts :id from the URL.
  // The `id!` non-null assertion is safe here because this page
  // is only rendered when the route /books/:id is matched.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addingCart, setAddingCart] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Fetch book + reviews in parallel
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        // TEACH: Promise.allSettled() runs both requests at the
        // same time (parallel). Unlike Promise.all(), if one fails
        // the other still resolves. We get book data even if
        // reviews fail (e.g. no reviews yet → 404).
        const [bookRes, reviewsRes] = await Promise.allSettled([
          bookApi.getById(id),
          reviewApi.getByBook(id),
        ]);
        if (bookRes.status === "fulfilled")
          setBook(bookRes.value.data.data ?? []);
        if (reviewsRes.status === "fulfilled") {
          const payload = reviewsRes.value.data.data;
          setReviews(payload?.reviews ?? []);
        }
      } catch {
        message.error("Failed to load book");
        navigate("/books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // re-fetch if the id URL param changes

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.warning("Please sign in first");
      return;
    }
    if (!book) return;
    setAddingCart(true);
    try {
      await cartApi.addItem(book.id, qty);
      await fetchCart();
      message.success(`${qty} × "${book.title}" added to cart`);
    } catch (err) {
      message.error(extractApiError(err));
    } finally {
      setAddingCart(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  if (!book) return null;

  const isOutOfStock = book.stockCount === 0;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // TEACH: Tabs items array — each item is { key, label, children }.
  // Much cleaner than nested JSX. AntD renders the correct panel
  // based on the active key.
  const tabItems = [
    {
      key: "details",
      label: "Details",
      children: (
        <div style={styles.detailsTab}>
          <div style={styles.metaGrid}>
            {[
              ["Author", book.author],
              ["ISBN", book.isbn],
              ["Genre", book.genre ?? "—"],
              ["Listed by", book.shop?.name ?? "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <Typography variant="caption" color="secondary">
                  {label}
                </Typography>
                <Typography variant="bodyMedium" style={{ marginTop: 2 }}>
                  {value}
                </Typography>
              </div>
            ))}
          </div>
          {book.description && (
            <>
              <Divider />
              <Typography
                variant="bodyMedium"
                color="secondary"
                style={{ lineHeight: 1.8 }}
              >
                {book.description}
              </Typography>
            </>
          )}
        </div>
      ),
    },
    {
      key: "reviews",
      label: `Reviews (${reviews.length})`,
      children: (
        <div>
          {reviews.length === 0 ? (
            <Typography variant="bodyMedium" color="secondary">
              No reviews yet. Purchase this book to leave the first review.
            </Typography>
          ) : (
            reviews.map((r) => (
              <div key={r.id} style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <div style={styles.avatar}>
                    <Typography
                      variant="caption"
                      style={{ color: "#fff", fontWeight: 600 }}
                    >
                      {r.buyer?.name?.[0] ?? "U"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="label">
                      {r.buyer?.name ?? "Reader"}
                    </Typography>
                    <Rate
                      disabled
                      value={r.rating}
                      style={{ fontSize: 12, display: "block" }}
                    />
                  </div>
                  {r.isVerifiedPurchase && (
                    <Tag
                      color="green"
                      style={{ marginLeft: "auto", borderRadius: 980 }}
                    >
                      Verified
                    </Tag>
                  )}
                </div>
                {r.comment && (
                  <Typography
                    variant="bodySmall"
                    color="secondary"
                    style={{ marginTop: 8 }}
                  >
                    {r.comment}
                  </Typography>
                )}
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              title: (
                <span
                  onClick={() => navigate("/books")}
                  style={styles.breadLink}
                >
                  Books
                </span>
              ),
            },
            { title: book.title },
          ]}
        />

        <div style={styles.layout}>
          {/* ── Left: book visual ── */}
          <div style={styles.leftCol}>
            <div
              style={{
                ...styles.bookCover,
                background: getGenreColor(book.genre),
              }}
            >
              <Typography
                variant="h3Regular"
                style={{
                  color: "#fff",
                  textAlign: "center",
                  letterSpacing: "-0.02em",
                }}
              >
                {book.title}
              </Typography>
              <Typography
                variant="bodySmall"
                style={{ color: "rgba(255,255,255,0.75)", marginTop: 12 }}
              >
                {book.author}
              </Typography>
              {book.genre && (
                <Tag
                  style={{
                    marginTop: 20,
                    borderRadius: 980,
                    border: "none",
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
                >
                  {book.genre}
                </Tag>
              )}
            </div>

            {/* Shop info card */}
            {book.shop && (
              <div style={styles.shopCard}>
                <ShopOutlined
                  style={{ color: colors.primary, marginRight: 8 }}
                />
                <div>
                  <Typography variant="label">{book.shop.name}</Typography>
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={{ display: "block" }}
                  >
                    Verified seller
                  </Typography>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: info + purchase ── */}
          <div style={styles.rightCol}>
            {/* Status badge */}
            <Tag
              color={getBookStatusColor(book.status)}
              style={{ borderRadius: 980, marginBottom: 12 }}
            >
              {book.status.replace("_", " ")}
            </Tag>

            <Typography
              variant="h2Semibold"
              style={{ letterSpacing: "-0.02em", marginBottom: 4 }}
            >
              {book.title}
            </Typography>
            <Typography
              variant="bodyLarge"
              color="secondary"
              style={{ marginBottom: 16 }}
            >
              by {book.author}
            </Typography>

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Rate
                  disabled
                  value={avgRating}
                  allowHalf
                  style={{ fontSize: 14 }}
                />
                <Typography variant="bodySmall" color="secondary">
                  {avgRating.toFixed(1)} ({reviews.length} reviews)
                </Typography>
              </div>
            )}

            <Divider style={{ margin: "20px 0" }} />

            {/* Price */}
            <Typography
              variant="h1Regular"
              style={{
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              ₹{book.price.toLocaleString("en-IN")}
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              style={{ marginBottom: 24, display: "block" }}
            >
              {isOutOfStock
                ? "Currently out of stock"
                : `${book.stockCount} copies available`}
            </Typography>

            {/* Quantity + cart */}
            {!isOutOfStock && (
              <div style={styles.purchaseRow}>
                <div style={styles.qtyWrap}>
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={{ marginBottom: 4, display: "block" }}
                  >
                    Qty
                  </Typography>
                  {/* TEACH: InputNumber is AntD's number stepper.
                      min/max enforce boundaries. onChange fires on
                      every change including keyboard input. */}
                  <InputNumber
                    min={1}
                    max={Math.min(book.stockCount, 10)}
                    value={qty}
                    onChange={(v) => setQty(v ?? 1)}
                    style={{ width: 80, borderRadius: 12 }}
                  />
                </div>
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  loading={addingCart}
                  onClick={handleAddToCart}
                  style={styles.cartBtn}
                  block
                >
                  Add to cart — ₹{(book.price * qty).toLocaleString("en-IN")}
                </Button>
              </div>
            )}

            <Divider style={{ margin: "24px 0" }} />

            {/* Tabs */}
            <Tabs items={tabItems} defaultActiveKey="details" />
          </div>
        </div>
      </div>
    </div>
  );
};

function getGenreColor(genre?: string): string {
  const map: Record<string, string> = {
    Programming: "#0071e3",
    Fiction: "#5856d6",
    Science: "#34c759",
    History: "#ff9500",
    Philosophy: "#af52de",
    Business: "#ff3b30",
    Biography: "#30b0c7",
  };
  return genre ? (map[genre] ?? "#636366") : "#636366";
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f7", paddingBottom: 60 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px" },
  loadingWrap: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  breadLink: { cursor: "pointer", color: colors.primary },
  layout: { display: "flex", gap: 48, alignItems: "flex-start" },
  leftCol: { width: 280, flexShrink: 0 },
  rightCol: { flex: 1 },
  bookCover: {
    borderRadius: 20,
    padding: "48px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 16,
  },
  shopCard: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "#fff",
    borderRadius: 14,
    padding: "12px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  purchaseRow: { display: "flex", gap: 16, alignItems: "flex-end" },
  qtyWrap: { flexShrink: 0 },
  cartBtn: { borderRadius: 980, height: 48, fontWeight: 500, flex: 1 },
  detailsTab: {},
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px 32px",
  },
  reviewItem: {
    padding: "16px 0",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  reviewHeader: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default BookDetailPage;
