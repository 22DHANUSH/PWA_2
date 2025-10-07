import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Select,
  Checkbox,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup } from "./../../users.api";
import { setUser } from "./../../users.slice";
import "../Auth.css";
import "../../../../assets/styles/global.css";
import logo from "../../../../assets/images/columbialogo.png";
import { mergeGuestCart } from "../../../Cart/cart.api";
import AuthFooter from "../../../Products/Product_Landing/Components/AuthFooter";
import AuthHeader from "../../../Products/Product_Landing/Components/AuthHeader";
import { useCart } from "../../../Cart/CartContext";

const { Title } = Typography;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { refreshCartCount } = useCart();

  const onFinish = async (values) => {
    if (values.PasswordHash !== values.confirmPassword) {
      form.setFields([
        {
          name: "confirmPassword",
          errors: ["Passwords do not match"],
        },
      ]);
      return;
    }

    const fullPhoneNumber = `${values.CountryCode}${values.PhoneNumber}`;
    const { confirmPassword, CountryCode, PhoneNumber, ...rest } = values;
    const payload = { ...rest, PhoneNumber: fullPhoneNumber };

    setLoading(true);
    try {
      const res = await signup(payload);

      if (res.userId) {
        message.success(res.message || "Sign up successful");
        dispatch(setUser({ userId: res.userId, email: values.email }));
        await mergeGuestCart(res.userId);
        await refreshCartCount();
        navigate("/");
        return;
      }

      message.error("Signup failed. Please try again.");
    } catch (err) {
      console.error("Signup error:", err);

      const fieldErrors = err?.response?.data?.errors;
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
        message.error(`Signup failed: ${errorSummary}`);
      } else {
        const fallbackError = err?.message || "Please try again.";
        message.error(`Signup failed: ${fallbackError}`);
      }
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
              Sign Up
            </Title>

            <Form layout="vertical" onFinish={onFinish} form={form}>
              {}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="First Name"
                    name="FirstName"
                    rules={[
                      { required: true, message: "First name is required" },
                    ]}
                  >
                    <Input placeholder="First Name" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Last Name"
                    name="LastName"
                    rules={[
                      { required: true, message: "Last name is required" },
                    ]}
                  >
                    <Input placeholder="Last Name" allowClear />
                  </Form.Item>
                </Col>
              </Row>

              {}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                  >
                    <Input placeholder="Email" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item label="Phone Number" required>
                    <Input.Group compact>
                      <Form.Item
                        name="CountryCode"
                        noStyle
                        initialValue="+91"
                        rules={[
                          {
                            required: true,
                            message: "Country code is required",
                          },
                        ]}
                      >
                        <Select className="country-code-select">
                          <Select.Option value="+91">+91</Select.Option>
                          <Select.Option value="+1">+1</Select.Option>
                          <Select.Option value="+44">+44</Select.Option>
                          <Select.Option value="+61">+61</Select.Option>
                          <Select.Option value="+81">+81</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="PhoneNumber"
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: "Mobile number is required",
                          },
                          {
                            pattern: /^\d{10,15}$/,
                            message:
                              "Enter a valid mobile number (10–15 digits)",
                          },
                        ]}
                      >
                        <Input
                          className="phone-number-input"
                          placeholder="Mobile Number"
                          allowClear
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                </Col>
              </Row>

              {}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Password"
                    name="PasswordHash"
                    rules={[
                      { required: true, message: "Please enter your password" },
                      {
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
                        message:
                          "At least 8 chars, include uppercase, lowercase & special char",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Enter Password" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["PasswordHash"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("PasswordHash") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm Password" />
                  </Form.Item>
                </Col>
              </Row>

              {}
              <Form.Item
                name="consent"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("You must consent to proceed")
                          ),
                  },
                ]}
              >
                <Checkbox>
                  <span style={{ color: "red", marginRight: "4px" }}>*</span>I
                  consent to the{" "}
                  <span
                    className="data-link"
                    title="By registering, you agree to the collection and processing of your personal information in accordance with our Privacy Policy."
                  >
                    use of my data
                  </span>{" "}
                  for account creation, communication, and personalized
                  services.
                </Checkbox>
              </Form.Item>

              {}
              <Form.Item>
                <Button
                  type="default"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="btn-auth"
                >
                  Sign up
                </Button>
              </Form.Item>
              <Form.Item>
                <p className="auth-footer">
                  Already have an account?{" "}
                  <a href="/login" className="auth-link">
                    Login
                  </a>
                </p>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
}
