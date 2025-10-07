import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "./../../users.api";
import "./../../Auth/Auth.css";
import "../../../../assets/styles/global.css";
import logo from "../../../../assets/images/columbialogo.png";
import AuthFooter from "../../../Products/Product_Landing/Components/AuthFooter";
import AuthHeader from "../../../Products/Product_Landing/Components/AuthHeader";
 
const { Title, Text } = Typography;
 
export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 const [form] = Form.useForm();
 
const onFinish = async (values) => {
  setLoading(true);
  try {
    const res = await forgotPassword({
      email: values.email,
      password: values.password,
    });
 
    if (res.errors) {
      const formattedErrors = Object.entries(res.errors).map(([field, errorMsg]) => ({
        name: field,
        errors: [errorMsg],
      }));
 
      form.setFields(formattedErrors);
      form.scrollToField(formattedErrors[0].name);
 
      message.error(res.message || "Password reset failed.");
      return;
    }
 
    message.success(res.message || "Password updated successfully");
    navigate("/login");
  } catch (err) {
  console.error("Forgot password error:", err);
 
  const backendErrors = err?.response?.data?.errors;
  const errorMessage =
    backendErrors?.password ||
    backendErrors?.email ||
    err?.response?.data?.message ||
    err?.message ||
    "Error resetting password. Please try again.";
 
  message.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
 
  return (
    <>
    <AuthHeader />
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-overlay"></div>
      </div>
 
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="Brand Logo" />
            <Title level={4}>Columbia Sportswear Company</Title>
          </div>
 
          <Title level={3} className="auth-title">Reset Password</Title>
       
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="Email" />
            </Form.Item>
 
            <Form.Item
              label="New Password"
              name="password"
              rules={[{ required: true, message: "Please enter a new password" }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
 
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
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
              <Input.Password placeholder="••••••••" />
            </Form.Item>
 
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
 
          <p className="auth-footer">
            Remembered your password? <a href="/login" className="auth-link">Sign in</a>
          </p>
          <p className="auth-footer">
            Don’t have an account? <a href="/signup" className="auth-link">Sign up</a>
          </p>
        </div>
      </div>
    </div>
    <AuthFooter />
    </>
  );
}
 