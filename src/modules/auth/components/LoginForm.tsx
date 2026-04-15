import React, { useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { LoginPayload } from "../types/auth.types";
// import { Typography } from '../../../theme/typography';

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: LoginPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login(values);
      // const { user, accessToken, refreshToken } = res.data;
      // setAuth(user, accessToken, refreshToken);
      const { userId, name, role, token } = res.data.data;

      setAuth({ id: userId, name, role }, token);

      if (role === "ADMIN") navigate("/admin/books");
      else if (role === "SELLER") navigate("/seller/dashboard");
      else navigate("/books");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} size="large">
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 12 }}
        />
      )}

      <Form.Item
        name="email"
        rules={[
          { required: true, message: "Email is required" },
          { type: "email", message: "Enter a valid email" },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: "#86868b" }} />}
          placeholder="Email"
          style={{ borderRadius: 12, height: 52 }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Password is required" }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#86868b" }} />}
          placeholder="Password"
          style={{ borderRadius: 12, height: 52 }}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          style={{
            height: 52,
            borderRadius: 980,
            fontSize: 16,
            fontWeight: 600,
            background: "#0071e3",
            border: "none",
          }}
        >
          Sign In
        </Button>
      </Form.Item>
    </Form>
  );
};
