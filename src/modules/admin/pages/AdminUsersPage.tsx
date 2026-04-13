// ═══════════════════════════════════════════════════════════
// FILE: src/modules/admin/pages/AdminUsersPage.tsx  (Part 8)
//
// TEACH — Popconfirm for destructive actions:
// Suspending a user is irreversible (in this flow). We use
// Popconfirm directly on the button — no separate modal needed
// for single-click confirmations. Keeps the page clean.
//
// TEACH — Table rowClassName:
// rowClassName receives the record and returns a CSS class.
// We use inline style instead (no CSS files) to highlight
// suspended users with a red-tinted background.
// ═══════════════════════════════════════════════════════════

import { Table, Tag, Popconfirm, Avatar, Button, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { User } from "@/types/api.types";
import { UserOutlined as UserIcon, StopOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { adminApi } from "../api/admin.api";
import { extractApiError } from "@/api/axiosClient";
import { Typography } from "@/theme/AppTypography";
import { colors } from "@/theme/colors";

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getUsers({ page, limit: 20 });
        setUsers(res.data.data.items);
        setTotal(res.data.data.total);
      } catch {
        /* handled globally */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const handleSuspend = async (userId: string) => {
    setSuspendingId(userId);
    try {
      await adminApi.suspendUser(userId);
      // Mark suspended locally
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isSuspended: true } : u)),
      );
      message.success("User suspended");
    } catch (err) {
      message.error(extractApiError(err));
    } finally {
      setSuspendingId(null);
    }
  };

  const ROLE_COLOR: Record<string, string> = {
    BUYER: "blue",
    SELLER: "purple",
    ADMIN: "red",
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      render: (_: unknown, u: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={36}
            style={{
              background:
                ROLE_COLOR[u.role] === "blue" ? colors.primary : "#5856d6",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {u.name[0].toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="label">{u.name}</Typography>
            <Typography
              variant="caption"
              color="secondary"
              style={{ display: "block" }}
            >
              {u.email}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (r: string) => (
        <Tag
          color={ROLE_COLOR[r]}
          style={{ borderRadius: 980, fontWeight: 500 }}
        >
          {r}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      render: (v: string) => (
        <Typography variant="bodySmall" color="secondary">
          {new Date(v).toLocaleDateString("en-IN")}
        </Typography>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, u: User & { isSuspended?: boolean }) =>
        u.isSuspended ? (
          <Tag color="red" style={{ borderRadius: 980 }}>
            Suspended
          </Tag>
        ) : (
          <Tag color="green" style={{ borderRadius: 980 }}>
            Active
          </Tag>
        ),
    },
    {
      title: "",
      key: "action",
      render: (_: unknown, u: User & { isSuspended?: boolean }) =>
        u.role !== "ADMIN" && !u.isSuspended ? (
          <Popconfirm
            title={`Suspend ${u.name}?`}
            description="They won't be able to log in or make any transactions."
            onConfirm={() => handleSuspend(u.id)}
            okText="Suspend"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              loading: suspendingId === u.id,
              style: { borderRadius: 980 },
            }}
            cancelButtonProps={{ style: { borderRadius: 980 } }}
          >
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              loading={suspendingId === u.id}
              style={{ borderRadius: 980 }}
            >
              Suspend
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f7" }}>
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "32px 32px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserIcon style={{ fontSize: 22, color: "#5856d6" }} />
          <div>
            <Typography
              variant="h2Semibold"
              style={{ letterSpacing: "-0.02em" }}
            >
              Users
            </Typography>
            <Typography
              variant="bodySmall"
              color="secondary"
              style={{ marginTop: 2 }}
            >
              {total} registered users
            </Typography>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px 48px" }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          style={{
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
          rowClassName={(record: User & { isSuspended?: boolean }) =>
            record.isSuspended ? "suspended-row" : ""
          }
          onRow={(record: User & { isSuspended?: boolean }) => ({
            style: record.isSuspended
              ? { background: "#fff5f5", opacity: 0.7 }
              : undefined,
          })}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t) => `${t} users`,
          }}
        />
      </div>
    </div>
  );
};

export default AdminUsersPage;
