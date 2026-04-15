// ═══════════════════════════════════════════════════════════
// FILE: src/modules/admin/pages/AdminShopsPage.tsx  (Part 8)
//
// TEACH — Reusing the same pattern across pages:
// AdminShopsPage is structurally identical to AdminBooksPage.
// This is intentional — consistent patterns mean:
//   1. New devs learn the pattern once, apply everywhere
//   2. Users get a consistent UX (predictable UI)
//   3. Bugs fixed in one place apply to all similar pages
//
// In a real codebase you'd extract a <ReviewCard> component
// used by both pages. We keep them separate here for clarity.
// ═══════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  Spin,
  Row,
  Col,
  Divider,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ShopOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { adminApi } from "../api/admin.api";
import { extractApiError } from "@/api/axiosClient";
import { Typography } from "@/theme/AppTypography";
import { colors } from "@/theme/colors";
import type { PendingShop } from "@/types/api.types";

type ActionType = "APPROVE" | "REJECT" | null;

const AdminShopsPage: React.FC = () => {
  const [shops, setShops] = useState<PendingShop[]>([]);
  // const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<PendingShop  | null>(null);
  const [action, setAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getPendingShops({ limit: 20 });
        setShops(res.data.data ?? []);
        // const shops = (res.data.data?? []).map((shop: any) => ({
        //   ...shop,
        //   id: shop.shopId,
        // }));
        // setShops(shops)
        console.log("Pending shops from API:", res.data.data);
        // setTotal(res.data.total ?? 0);
      } catch {
        /* handled globally */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleVerify = async () => {
    if (!selectedShop || !action) return;
    setSubmitting(true);
    try {
      await adminApi.verifyShop(selectedShop.shopId, action, reason || undefined);
      setShops((prev) => prev.filter((s) => s.shopId !== selectedShop.shopId));
      // setTotal((t) => t - 1);
      message.success(
        action === "APPROVE"
          ? `"${selectedShop.name}" shop is now active!`
          : `"${selectedShop.name}" shop has been rejected`,
      );
      setSelectedShop(null);
      setAction(null);
      setReason("");
    } catch (err) {
      message.error(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Shop status color gradient — each shop gets a unique visual
  const SHOP_COLORS = [
    "#0071e3",
    "#5856d6",
    "#ff9500",
    "#34c759",
    "#af52de",
    "#ff3b30",
    "#30b0c7",
  ];
  const getShopColor = (id: string) =>
    SHOP_COLORS[id.charCodeAt(0) % SHOP_COLORS.length];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ShopOutlined style={{ fontSize: 22, color: "#ff9500" }} />
          <div>
            <Typography
              variant="h2Semibold"
              style={{ letterSpacing: "-0.02em" }}
            >
              Pending shops
            </Typography>
            {/* <Typography
              variant="bodySmall"
              color="secondary"
              style={{ marginTop: 2 }}
            >
              {total} shop{total !== 1 ? "s" : ""} awaiting verification
            </Typography> */}
          </div>
          {/* {total > 0 && (
            <Badge
              count={total}
              style={{ background: "#ff9500" }}
              overflowCount={99}
            />
          )} */}
        </div>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={styles.center}>
            <Spin size="large" />
          </div>
        ) : shops.length === 0 ? (
          <div style={styles.center}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#e8faf0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <CheckOutlined style={{ fontSize: 32, color: "#34c759" }} />
            </div>
            <Typography variant="h3Regular" style={{ marginBottom: 8 }}>
              All caught up!
            </Typography>
            <Typography variant="bodyMedium" color="secondary">
              No shops pending review.
            </Typography>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {shops.map((shop) => (
              <Col key={shop.shopId} xs={24} sm={12} lg={8}>
                <Card style={styles.shopCard}>
                  {/* Shop color header */}
                  <div
                    style={{
                      ...styles.shopStrip,
                      background: getShopColor(shop.shopId),
                    }}
                  >
                    <div style={styles.shopAvatar}>
                      <Typography
                        variant="h3Regular"
                        style={{ color: getShopColor(shop.shopId), lineHeight: 1 }}
                      >
                        {shop.name[0].toUpperCase()}
                      </Typography>
                    </div>
                  </div>

                  <div style={{ padding: "16px 16px 12px" }}>
                    <Typography
                      variant="h4Semibold"
                      style={{ marginBottom: 8 }}
                    >
                      {shop.name}
                    </Typography>
                    {/* {shop.description && (
                      <Typography
                        variant="bodySmall"
                        color="secondary"
                        style={{ marginBottom: 12 }}
                      >
                        {shop.description.length > 80
                          ? shop.description.slice(0, 80) + "…"
                          : shop.description}
                      </Typography>
                    )} */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <CalendarOutlined
                        style={{ color: colors.textTertiary, fontSize: 11 }}
                      />
                      <Typography variant="caption" color="secondary">
                        Applied{" "}
                        {new Date(shop.submittedAt).toLocaleDateString("en-IN")}
                      </Typography>
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => {
                          setSelectedShop(shop);
                          setAction("REJECT");
                          setReason("");
                        }}
                        style={{ flex: 1, borderRadius: 980 }}
                      >
                        Reject
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => {
                          setSelectedShop(shop);
                          setAction("APPROVE");
                          setReason("");
                        }}
                        style={{
                          flex: 1,
                          borderRadius: 980,
                          background: "#34c759",
                          borderColor: "#34c759",
                        }}
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
      </div>

      <Modal
        open={!!selectedShop && !!action}
        onCancel={() => {
          setSelectedShop(null);
          setAction(null);
        }}
        onOk={handleVerify}
        okText={action === "APPROVE" ? "Approve shop" : "Reject shop"}
        okButtonProps={{
          danger: action === "REJECT",
          loading: submitting,
          style: { borderRadius: 980 },
          disabled: action === "REJECT" && !reason.trim(),
        }}
        cancelButtonProps={{ style: { borderRadius: 980 } }}
        title={
          <Typography variant="h4Semibold">
            {action === "APPROVE" ? "Approve shop" : "Reject shop"}
          </Typography>
        }
      >
        {selectedShop && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                background: "#f5f5f7",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
              }}
            >
              <Typography variant="label">{selectedShop.name}</Typography>
              {/* {selectedShop.description && (
                <Typography
                  variant="caption"
                  color="secondary"
                  style={{ display: "block", marginTop: 2 }}
                >
                  {selectedShop.description}
                </Typography>
              )} */}
            </div>
            {action === "APPROVE" ? (
              <Typography variant="bodyMedium" color="secondary">
                This seller will be able to list books immediately.
              </Typography>
            ) : (
              <>
                <Typography
                  variant="bodySmall"
                  color="secondary"
                  style={{ marginBottom: 10 }}
                >
                  Reason for rejection (seller will be notified):
                </Typography>
                <Input.TextArea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Incomplete information, suspicious activity…"
                  style={{
                    background: "#f5f5f7",
                    border: "none",
                    borderRadius: 10,
                  }}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f5f5f7" },
  header: {
    background: "#fff",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    padding: "32px 32px 24px",
    marginBottom: 24,
  },
  container: { padding: "0 32px 48px" },
  center: {
    minHeight: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  shopCard: {
    borderRadius: 16,
    border: "none",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    overflow: "hidden",
    padding: 0,
  },
  shopStrip: {
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  shopAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default AdminShopsPage;
