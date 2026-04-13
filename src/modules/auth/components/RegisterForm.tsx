import React, { useState } from 'react';
import { Form, Input, Button, Alert, Segmented } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import { RegisterPayload } from '../types/auth.types';

export const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onFinish = async (values: Omit<RegisterPayload, 'role'>) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register({ ...values, role });
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);

      if (role === 'SELLER') navigate('/seller/dashboard');
      else navigate('/books');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed.');
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

      <Form.Item style={{ marginBottom: 24 }}>
        <Segmented
          block
          options={[
            { label: 'Buy Books', value: 'BUYER' },
            { label: 'Sell Books', value: 'SELLER' },
          ]}
          value={role}
          onChange={(v) => setRole(v as 'BUYER' | 'SELLER')}
          style={{ borderRadius: 12, padding: 4 }}
        />
      </Form.Item>

      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Name is required' }]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#86868b' }} />}
          placeholder="Full Name"
          style={{ borderRadius: 12, height: 52 }}
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input
          prefix={<MailOutlined style={{ color: '#86868b' }} />}
          placeholder="Email"
          style={{ borderRadius: 12, height: 52 }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Password is required' },
          { min: 8, message: 'Minimum 8 characters' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#86868b' }} />}
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
            background: '#0071e3',
            border: 'none',
          }}
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );
};