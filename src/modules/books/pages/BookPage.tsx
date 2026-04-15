// ─────────────────────────────────────────────────────────────
// BooksPage.tsx  (Part 4)
//
// TEACH — useEffect for data fetching:
// The canonical pattern is:
//   useEffect(() => { fetchData() }, [dependency])
//
// The dependency array controls WHEN the effect re-runs:
//   []         → run once on mount (like componentDidMount)
//   [page]     → run every time `page` changes
//   [page, q]  → run when either changes
//   no array   → run after EVERY render (almost never what you want)
//
// TEACH — Debouncing search:
// Without debounce: typing "clean code" fires 10 API calls
//   (c, cl, cle, clea, clean, clean , etc.)
// With debounce:    waits 400ms after last keystroke → 1 API call
// Our useDebounce hook wraps useState + useEffect into one line.
//
// TEACH — useCallback:
// Functions defined inside a component are recreated on every render.
// If we pass handleAddToCart to BookCard without useCallback,
// React.memo on BookCard is useless — the prop always looks "new".
// useCallback caches the function between renders.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Input, Pagination, Spin, Empty, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { bookApi } from "../api/book.api";
import { cartApi } from "@/modules/cart/api/cart.api";
import { useCartStore } from "@/modules/cart/store/CartStore";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { extractApiError } from "@/api/axiosClient";
import { Typography } from "@/theme/AppTypography";
import { colors } from "@/theme/colors";
import BookCard from "../components/BookCard";
import type { Book } from "@/types/api.types";

const GENRES = [
  "All",
  "Programming",
  "Fiction",
  "Science",
  "History",
  "Philosophy",
  "Business",
  "Biography",
];

const BooksPage: React.FC = () => {
  // ── State ────────────────────────────────────────────────
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [addingId, setAddingId] = useState<string | null>(null);

  // TEACH: useDebounce — our custom hook from hooks/useDebounce.ts
  // debouncedSearch updates 400ms AFTER the user stops typing.
  // We use debouncedSearch in useEffect, not raw `search`.
  const debouncedSearch = useDebounce(search, 400);

  // TEACH: usePagination — our custom hook that holds page/limit.
  // Lifting this into a custom hook keeps BooksPage clean.
  const { page, limit, setPage, reset } = usePagination(12);

  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  // ── Fetch books ──────────────────────────────────────────
  // TEACH: This useEffect has 3 dependencies. It fires:
  //   - on mount (initial load)
  //   - whenever debounced search changes (user typed something)
  //   - whenever genre changes (user picked a filter)
  //   - whenever page changes (user clicked pagination)
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await bookApi.search({
          search: debouncedSearch || undefined,
          genre: genre === "All" ? undefined : genre,
          page,
          limit,
        });
        const result = res.data.data;

        setBooks(result.data ?? []);
        setTotal(res.data.data.total);
      } catch (err) {
        message.error(extractApiError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [debouncedSearch, genre, page, limit]);

  // Reset to page 1 whenever filters change
  // TEACH: Without this, searching while on page 5 would show
  // page 5 of the new results — which might not exist.
  useEffect(() => {
    reset();
  }, [debouncedSearch, genre]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add to cart ──────────────────────────────────────────
  // TEACH: useCallback with [isAuthenticated] dependency.
  // The function is only recreated if isAuthenticated changes.
  // BookCard gets the same function reference across renders
  // → React.memo prevents unnecessary BookCard re-renders.
  const handleAddToCart = useCallback(
    async (bookId: string) => {
      if (!isAuthenticated) {
        message.warning("Please sign in to add books to cart");
        return;
      }
      setAddingId(bookId);
      try {
        await cartApi.addItem(bookId, 1);
        await fetchCart(); // refresh Zustand cart state → Navbar badge updates
        message.success("Added to cart!");
      } catch (err) {
        message.error(extractApiError(err));
      } finally {
        setAddingId(null);
      }
    },
    [isAuthenticated, fetchCart],
  );

  return (
    <div style={styles.page}>
      {/* ── Header ────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <Typography variant="h2Semibold" style={styles.heading}>
            Discover Books
          </Typography>
          <Typography variant="bodyMedium" color="secondary">
            {(total ?? 0).toLocaleString("en-IN")} books from verified sellers
          </Typography>
        </div>
      </div>

      <div style={styles.container}>
        {/* ── Filters ───────────────────────────────────────── */}
        <div style={styles.filtersRow}>
          {/* TEACH: Input.Search is AntD's search input component.
              onChange fires on every keystroke. We store raw `search`
              and let useDebounce handle the delay. */}
          <Input
            prefix={<SearchOutlined style={{ color: colors.textTertiary }} />}
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            size="large"
            allowClear
          />

          {/* Genre filter pills */}
          <div style={styles.genrePills}>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                style={{
                  ...styles.pill,
                  background: genre === g ? colors.primary : "#f5f5f7",
                  color: genre === g ? "#fff" : colors.textSecondary,
                  border:
                    genre === g
                      ? `1.5px solid ${colors.primary}`
                      : "1.5px solid transparent",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ── Book grid ─────────────────────────────────────── */}
        {/* TEACH: AntD's Row/Col grid uses a 24-column system.
            xs=24 → 1 column on mobile
            sm=12 → 2 columns on small tablets
            md=8  → 3 columns on medium
            lg=6  → 4 columns on large screens
            gutter={[16,16]} sets horizontal AND vertical gap. */}
        {loading ? (
          <div style={styles.center}>
            <Spin size="large" />
          </div>
        ) : books.length === 0 ? (
          <div style={styles.center}>
            <Empty description="No books found" />
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {books.map((book) => (
              <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                <BookCard
                  book={book}
                  onAddToCart={handleAddToCart}
                  cartLoading={addingId === book.id}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        {/* TEACH: AntD Pagination is controlled — we own `page`.
            onChange receives the NEW page number.
            total + pageSize is all AntD needs to calculate pages. */}
        {total > limit && (
          <div style={styles.paginationWrap}>
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
              showTotal={(t) => `${t} books`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f7",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    padding: "48px 0 32px",
    marginBottom: 32,
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
  },
  heading: {
    marginBottom: 6,
    letterSpacing: "-0.02em",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px 48px",
  },
  filtersRow: {
    marginBottom: 28,
  },
  searchInput: {
    marginBottom: 16,
    background: "#fff",
    borderRadius: 12,
    border: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  genrePills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    padding: "6px 16px",
    borderRadius: 980,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  paginationWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: 40,
  },
};

export default BooksPage;
