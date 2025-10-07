import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./../../users.api";
import { setUser } from "./../../users.slice";
import "./../../Auth/Auth.css";
import "../../../../assets/styles/global.css";
import logo from "../../../../assets/images/columbialogo.png";
import { mergeGuestCart } from "../../../Cart/cart.api";
import AuthFooter from "../../../Products/Product_Landing/Components/AuthFooter";
import AuthHeader from "../../../Products/Product_Landing/Components/AuthHeader";
import { useCart } from "../../../Cart/CartContext";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { refreshCartCount } = useCart();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);

      if (res.userId) {
        message.success(res.message || "Login successful");
        dispatch(setUser({ userId: res.userId, email: values.email }));
        await mergeGuestCart(res.userId);
        await refreshCartCount();
        navigate("/");
        return;
      }

      const fieldErrors = res?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const formattedErrors = Object.entries(fieldErrors).map(
          ([field, errorMsg]) => ({
            name: field,
            errors: [errorMsg],
          })
        );

        form.setFields(formattedErrors);
        form.scrollToField(formattedErrors[0].name);

        const errorSummary = Object.values(fieldErrors).join(" | ");
        message.error(`Login failed: ${errorSummary}`);
      } else {
        message.error(res.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const fallbackError = err?.message || "Server error. Please try again.";
      message.error(`Login failed: ${fallbackError}`);
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
            </div>

            <Title level={3} className="auth-title">
              Welcome Back, Happy Shopping!
            </Title>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please enter a valid email",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="Password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>

              <Form.Item>
                <Button
                  htmlType="submit"
                  block
                  loading={loading}
                  className="btn-auth"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
            <p className="auth-footer">
              Forgot your password?{" "}
              <a href="/forgot-password" className="auth-link">
                Reset Password
              </a>
            </p>
            <p className="auth-footer">
              Don’t have an account?{" "}
              <a href="/signup" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
}
