import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Divider,
  Button,
  Spin,
  Row,
  Col,
  message,
  Image,
  Space,
} from "antd";
import { ShoppingCartOutlined, HomeOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useGA4Tracking from "../../../../../useGA4Tracking";
import PromoCode from "../Components/PromoCode.jsx";
import { getImagesBySku } from "../../../Cart/cart.api";
import { fetchAddresses } from "../../../Users/users.api";
import {
  fetchCartSummary,
  confirmOrder,
  createOrder,
  setOrderMeta,
} from "../../order.slice";
import confetti from "canvas-confetti";

const { Title, Text } = Typography;

export default function OrderReview() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.order);
  const userId = useSelector((state) => state.auth.userId);
  const { trackPurchase } = useGA4Tracking();
  const [orderItems, setOrderItems] = useState([]);
  const [address, setAddress] = useState({});
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [summary, setSummary] = useState({});
  const [skuIds, setSkuIds] = useState([]);
  const [orderMetaDetail, setOrderMetaDetail] = useState({});

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchCartSummary({ userId }));

    const fetchPrimaryAddress = async () => {
      try {
        const addresses = await fetchAddresses(userId);
        const primary = addresses.find((a) => a.isPrimary) || addresses[0];
        if (primary) setAddress(primary);
      } catch {
        message.error("Unable to fetch address");
      }
    };
    fetchPrimaryAddress();
  }, [userId, dispatch]);

  useEffect(() => {
    if (!data) return;

    const itemsArray = Object.keys(data)
      .filter((key) => !isNaN(key))
      .map((key) => data[key]);

    const fetchImages = async () => {
      const itemsWithImages = await Promise.all(
        itemsArray.map(async (item, index) => {
          try {
            const images = await getImagesBySku(item.productSkuId);
            return {
              key: index,
              name: item.productTitle,
              quantity: item.quantity,
              color: item.productColor,
              size: item.productSize,
              price: parseFloat(item.productPrice.replace("$", "")),
              totalItemPrice:
                item.quantity * parseFloat(item.productPrice.replace("$", "")),
              image: images[0]?.imageUrl || "/placeholder.png",
              productSkuId: item.productSkuId,
              productId: item.productId,
            };
          } catch {
            return {
              key: index,
              name: item.productTitle,
              quantity: item.quantity,
              color: item.productColor,
              size: item.productSize,
              price: parseFloat(item.productPrice.replace("$", "")),
              totalItemPrice:
                item.quantity * parseFloat(item.productPrice.replace("$", "")),
              image: "/placeholder.png",
              productSkuId: item.productSkuId,
            };
          }
        })
      );

      setOrderItems(itemsWithImages);
      setSkuIds(itemsWithImages.map((i) => i.productSkuId));
      setOrderMetaDetail({
        orderDate: data.orderDate || data.order?.orderDate || null,
      });
    };
    fetchImages();
  }, [data]);

  useEffect(() => {
    if (orderItems.length === 0) return;

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.totalItemPrice,
      0
    );

    const discountAmount = appliedDiscount?.discountAmount || 0;
    const total =
      appliedDiscount?.totalAfterDiscount ?? subtotal - discountAmount;

    setSummary({
      subtotal,
      discount: discountAmount,
      total,
    });
  }, [appliedDiscount, orderItems]);

  const handleConfirmOrder = async () => {
    if (!userId || !summary.total || !address) {
      message.error("Missing order details");
      return;
    }
    try {
      const createdOrder = await createOrder({
        userId,
        addressId: address.addressId,
        totalAmount: summary.total,
      });

      await confirmOrder({ orderItems, createdOrder });

      trackPurchase({
        items: orderItems.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        value: summary.total,
        transaction_id: createdOrder,
        currency: "USD",
      });

      dispatch(
        setOrderMeta({
          orderId: createdOrder,
          addressId: address.addressId,
          totalAmount: summary.total,
        })
      );

      message.success("Order confirmed successfully!");
      navigate("/payment");
    } catch (err) {
      console.error(err);
      message.error("Order confirmation failed");
    }
  };

  const formatCurrency = (amount) =>
    `$${(isNaN(amount) ? 0 : amount).toFixed(2)}`;

  const handleDiscountApply = ({ discountAmount, totalAfterDiscount }) => {
    setAppliedDiscount({ discountAmount, totalAfterDiscount });
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: 100 }} />;
  if (error) return <Text type="danger">{error}</Text>;

  return (
    <Row
      justify="center"
      gutter={24}
      style={{ marginTop: 40, maxWidth: 1200, marginInline: "auto" }}
    >
      {/* Left section - Products */}
      <Col xs={24} lg={16}>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            padding: 16,
          }}
        >
          <Title level={3} style={{ marginBottom: 12 }}>
            <ShoppingCartOutlined /> Your Products
          </Title>
          <Divider />
          {orderItems.map((item) => (
            <Card
              key={item.key}
              size="small"
              style={{
                marginBottom: 16,
                borderRadius: 12,
              }}
              bodyStyle={{
                background: "#fafafa",
                padding: 12,
              }}
            >
              <Row gutter={16} align="middle">
                <Col xs={8} md={4}>
                  <Image
                    src={item.image}
                    width={80}
                    height={80}
                    style={{ borderRadius: 8, objectFit: "cover" }}
                  />
                </Col>
                <Col xs={16} md={20}>
                  <Text strong style={{ fontSize: 16 }}>
                    {item.name}
                  </Text>
                  <br />
                  <Text type="secondary">
                    Size: {item.size || "N/A"} • Color: {item.color || "N/A"}
                  </Text>
                  <br />
                  <Text>Qty: {item.quantity}</Text> •{" "}
                  <Text>Price: {formatCurrency(item.price)}</Text> •{" "}
                  <Text strong>
                    Total: {formatCurrency(item.totalItemPrice)}
                  </Text>
                </Col>
              </Row>
            </Card>
          ))}
        </Card>
      </Col>

      {/* Right section - Summary */}
      <Col xs={24} lg={8}>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 20,
          }}
        >
          <Title level={4}>
            <HomeOutlined /> Shipping
          </Title>
          <Divider />

          {/* Primary Address Card */}
          {Object.keys(address).length === 0 ? (
            <Text type="warning">No address found</Text>
          ) : (
            <Card
              size="small"
              style={{ marginBottom: 16, borderRadius: 12 }}
              bodyStyle={{ background: "#fafafa", padding: 12 }}
            >
              <Title level={5}>Primary Address</Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                {address.name && <Text>{address.name}</Text>}
                {address.addressLine1 && <Text>{address.addressLine1}</Text>}
                {address.addressLine2 && <Text>{address.addressLine2}</Text>}
                {address.city && <Text>{address.city}</Text>}
                {address.state && <Text>{address.state}</Text>}
                {address.zip && <Text>{address.zip}</Text>}
                {address.country && <Text>{address.country}</Text>}
              </Space>
            </Card>
          )}

          <Button
            type="primary"
            block
            size="large"
            style={{
              borderRadius: 8,
              backgroundColor: "#000000",
              borderColor: "#000000",
              marginBottom: 16,
            }}
            onClick={() => navigate("/addresses")}
          >
            Change Delivery Address
          </Button>

          <Divider />

          <PromoCode
            skuIds={skuIds}
            subtotal={summary.subtotal}
            onApply={handleDiscountApply}
          />

          <Divider />

          <Space direction="vertical" style={{ width: "100%" }}>
            <Row justify="space-between">
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(summary.subtotal)}</Text>
            </Row>
            <Row justify="space-between">
              <Text>Discount:</Text>
              <Text type="danger">
                -{formatCurrency(summary.discount || 0)}
              </Text>
            </Row>
            <Divider />
            <Row justify="space-between">
              <Title level={4}>Total:</Title>
              <Title level={4} style={{ color: "#000000" }}>
                {formatCurrency(summary.total)}
              </Title>
            </Row>
          </Space>

          <Button
            type="primary"
            block
            size="large"
            style={{
              marginTop: 24,
              borderRadius: 8,
              backgroundColor: "#000000",
              borderColor: "#000000",
            }}
            onClick={handleConfirmOrder}
          >
            Confirm & Pay
          </Button>
        </Card>
      </Col>
    </Row>
  );
}
