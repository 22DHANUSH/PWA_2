import {
  Card,
  Typography,
  Button,
  Radio,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import { useState, useEffect } from "react";
import BraintreePayment from "./BraintreePayment";
import { handleRazorpayPayment } from "./RazorpayPayment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUser, fetchAddresses } from "../Users/users.api";

const { Title, Text, Link } = Typography;

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("braintree");
  const [isRazorpay, setIsRazorpay] = useState(false);
  const [showBraintree, setShowBraintree] = useState(false);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState({});
  const emailId = useSelector((state) => state.auth.email);
  const userId = useSelector((state) => state.auth.userId);
  const navigate = useNavigate();

  const { orderId, totalAmount } = useSelector((state) => state.order);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser(userId);
        setUserName(res.firstName);
        setPhoneNumber(res.phoneNumber);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    const fetchPrimaryAddress = async () => {
      try {
        const addresses = await fetchAddresses(userId);
        const primary = addresses.find((a) => a.isPrimary) || addresses[0];
        if (primary) setAddress(primary);
      } catch (err) {
        message.error("Unable to fetch address");
      }
    };

    if (userId) {
      fetchUser();
      fetchPrimaryAddress();
    }
  }, [userId]);
  console.log(address);

  const handlePayClick = () => {
    if (paymentMethod === "razorpay") {
      handleRazorpayPayment({
        amount: totalAmount * 100,
        userId,
        orderId,
        userName,
        phoneNumber,
        emailId,
        address,
        navigate,
      });
    } else if (paymentMethod === "braintree") {
      setShowBraintree(true);
    }
  };

  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <Card
        style={{ width: "100%", maxWidth: 900, borderRadius: 12 }}
        bodyStyle={{ padding: "2rem" }}
      >
        <Title level={3}>Checkout</Title>

        <Row gutter={[32, 32]}>
          {/* Left Side */}
          <Col xs={24} md={14}>
            <Card
              size="small"
              style={{ marginBottom: "1.5rem", borderRadius: 8 }}
            >
              <Title level={5}>Delivery Address</Title>
              <Text strong>{userName}</Text>
              <br />
              <Text>
                {address.addressLine1}, {address.addressLine2}
              </Text>
              <br />
            </Card>

            <Card size="small" style={{ borderRadius: 8 }}>
              <Title level={5}>Payment Method</Title>
              <Radio.Group
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setIsRazorpay(e.target.value === "razorpay");
                  // setShowBraintree(false); // reset popup visibility
                }}
                value={paymentMethod}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Radio value="braintree">
                    <Text strong>Braintree</Text> <br />
                    <Text type="secondary">
                      Secure payments via PayPal or card.
                    </Text>
                  </Radio>
                  <Divider />
                  <Radio value="razorpay">
                    <Text strong>Razorpay</Text> <br />
                    <Text type="secondary">
                      Pay with credit/debit card, UPI, or net banking.
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </Card>
          </Col>

          {/* Right Side */}
          <Col xs={24} md={10}>
            <Card size="small" style={{ borderRadius: 8 }}>
              <Title level={5}>Order Summary</Title>
              <Row justify="space-between">
                <Text>Subtotal</Text>
                <Text>${totalAmount}</Text>
              </Row>
              <Row justify="space-between">
                <Text>Shipping</Text>
                <Text>Free</Text>
              </Row>
              <Row justify="space-between">
                <Text>Taxes</Text>
                <Text>$0</Text>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Title level={5}>Total</Title>
                <Title level={5}>${totalAmount}</Title>
              </Row>
              {isRazorpay ? (
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{ marginTop: "1rem", borderRadius: 8 }}
                  onClick={handlePayClick}
                >
                  Pay <span> &#8377;</span>
                  {totalAmount * 100}
                </Button>
              ) : (
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{ marginTop: "1rem", borderRadius: 8 }}
                  onClick={handlePayClick}
                >
                  Pay ${totalAmount}
                </Button>
              )}
              <Button
                block
                size="large"
                style={{
                  marginTop: "0.75rem",
                  borderRadius: 8,
                  background: "#f5f5f5",
                }}
                onClick={() => navigate("/cart")}
              >
                Back to Cart
              </Button>

              {/* Braintree Popup */}
              {showBraintree && (
                <div style={{ marginTop: "1.5rem" }}>
                  <BraintreePayment
                    amount={totalAmount}
                    firstName={userName}
                    emailId={emailId}
                    orderId={orderId}
                    userId={userId}
                    address={address}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
