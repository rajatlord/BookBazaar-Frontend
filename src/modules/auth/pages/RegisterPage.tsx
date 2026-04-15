// ─────────────────────────────────────────────────────────────
// RegisterPage.tsx  (Part 3)
//
// TEACH — Form.useWatch():
// Lets you read a field value as it changes WITHOUT submitting.
// We use it to read the selected role and show contextual UI
// ("You'll get a seller dashboard" etc.) in real-time.
//
// TEACH — Form.Item dependencies:
// The confirm-password rule uses a validator that calls
// form.getFieldValue('password'). This is how AntD handles
// cross-field validation — one field's rule can read another.
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Form, Input, Button, Select, message, Alert } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth.api";
// import { useAuthStore } from "../store/authStore";
import { extractApiError } from "@/api/axiosClient";
import { Typography } from "@/theme/AppTypography";
import { ROUTES } from "@/config/constants";
import { colors } from "@/theme/colors";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
  role: "BUYER" | "SELLER";
}

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);

  // TEACH: Form.useWatch reads a field value reactively.
  // 'role' updates every keystroke/change without form submission.
  const selectedRole = Form.useWatch("role", form);

  // const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      // const { user, token } = res.data.data
      // setAuth(user, token)
      message.success("Account created! Welcome to BookBazaar.");
      // const roleHome: Record<string, string> = {
      //   BUYER:  ROUTES.BOOKS,
      //   SELLER: ROUTES.SELLER,
      // }
      navigate(ROUTES.LOGIN, { replace: true });
      // navigate(roleHome[user.role] ?? ROUTES.BOOKS, { replace: true })
    } catch (err) {
      message.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Info text that updates as the user picks a role
  const roleInfo: Record<string, { title: string; desc: string }> = {
    BUYER: {
      title: "Buyer account",
      desc: "Browse, cart, and order books from verified sellers.",
    },
    SELLER: {
      title: "Seller account",
      desc: "List your books, manage inventory, and ship orders. Your shop will be reviewed within 24h.",
    },
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandMark}>
          <span style={{ fontSize: 32 }}>📚</span>
        </div>
        <Typography
          variant="h1Bold"
          style={{ marginBottom: 16, letterSpacing: "-0.03em" }}
        >
          Join BookBazaar
        </Typography>
        <Typography
          variant="bodyLarge"
          color="secondary"
          style={{ maxWidth: 340, marginBottom: 48 }}
        >
          Start your journey — as a reader discovering new worlds, or a seller
          sharing your collection.
        </Typography>

        {/* Role preview cards */}
        {["BUYER", "SELLER"].map((role) => (
          <div
            key={role}
            style={{
              ...styles.roleCard,
              borderColor:
                selectedRole === role ? colors.primary : "transparent",
              background:
                selectedRole === role ? colors.primaryLight : "#f5f5f7",
            }}
          >
            <Typography
              variant="label"
              style={{
                color: selectedRole === role ? colors.primary : "#1d1d1f",
              }}
            >
              {role === "BUYER" ? "🛒 Buyer" : "🏪 Seller"}
            </Typography>
            <Typography
              variant="caption"
              color="secondary"
              style={{ marginTop: 4, display: "block" }}
            >
              {roleInfo[role]?.desc}
            </Typography>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <Typography variant="h2Semibold" style={{ marginBottom: 6 }}>
            Create account
          </Typography>
          <Typography
            variant="bodyMedium"
            color="secondary"
            style={{ marginBottom: 32 }}
          >
            Already have one?{" "}
            <Link to={ROUTES.LOGIN} style={{ color: colors.primary }}>
              Sign in
            </Link>
          </Typography>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ role: "BUYER" }}
          >
            <Form.Item
              name="name"
              label={<span style={styles.label}>Full name</span>}
              rules={[
                { required: true, message: "Name is required" },
                { min: 2, message: "At least 2 characters" },
              ]}
            >
              <Input
                size="large"
                placeholder="Rajat Mathur"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span style={styles.label}>Email</span>}
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input
                size="large"
                placeholder="you@example.com"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={styles.label}>Password</span>}
              rules={[
                { required: true, message: "Password is required" },
                { min: 8, message: "At least 8 characters" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Min. 8 characters"
                style={styles.input}
              />
            </Form.Item>

            {/* TEACH: Cross-field validation — the validator function
                reads another field's value via getFieldValue().
                AntD injects `form` via the Form context internally. */}
            <Form.Item
              name="confirm"
              label={<span style={styles.label}>Confirm password</span>}
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Repeat password"
                style={styles.input}
              />
            </Form.Item>

            {/* TEACH: Select component — AntD handles open/close,
                keyboard navigation, and accessibility for free. */}
            <Form.Item
              name="role"
              label={<span style={styles.label}>I am a</span>}
              rules={[{ required: true }]}
              style={{ marginBottom: 24 }}
            >
              <Select size="large" style={styles.input}>
                <Select.Option value="BUYER">
                  Buyer — I want to shop for books
                </Select.Option>
                <Select.Option value="SELLER">
                  Seller — I want to sell books
                </Select.Option>
              </Select>
            </Form.Item>

            {/* Dynamic info alert based on selected role */}
            {selectedRole && roleInfo[selectedRole] && (
              <Alert
                message={roleInfo[selectedRole].title}
                description={roleInfo[selectedRole].desc}
                type="info"
                showIcon
                style={{ marginBottom: 24, borderRadius: 12, fontSize: 13 }}
              />
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={styles.submitBtn}
              >
                Create account
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f5f5f7",
  },
  leftPanel: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "80px 64px",
    background: "#fff",
    borderRight: "1px solid rgba(0,0,0,0.06)",
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: colors.primaryLight,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  roleCard: {
    padding: "14px 18px",
    borderRadius: 14,
    border: "1.5px solid",
    marginBottom: 12,
    transition: "all 0.2s",
  },
  rightPanel: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    overflowY: "auto",
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.06)",
  },
  label: { fontSize: 13, fontWeight: 500, color: "#1d1d1f" },
  input: {
    background: "#f5f5f7",
    border: "1px solid transparent",
    borderRadius: 12,
  },
  submitBtn: { height: 48, borderRadius: 980, fontSize: 15, fontWeight: 500 },
};

export default RegisterPage;
