import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Image,
  Pagination,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Space,
  Button,
  message,
  Flex,
} from "antd";
import {
  DownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { fetchAllOrdersByUser, setOrderItems } from "../../order.slice";
import Orders_api from "../../../../app/order.axios";
import { getProductImagesWithSas } from "../../../Users/users.api";

const { Text, Title } = Typography;

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userId);
  const { orders = [], loading } = useSelector((state) => state.order);

  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filter out "Pending" orders
  const filteredOrders = orders.filter(
    (order) => order.status !== "Payment Pending"
  );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (userId) {
      dispatch(fetchAllOrdersByUser(userId));
    }
  }, [userId, dispatch]);

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await Orders_api.get(`/order_items/byOrder/${orderId}`);
      const items = await Promise.all(
        (Array.isArray(response.data) ? response.data : []).map(
          async (item, index) => {
            let imageUrl = "/placeholder.png";
            try {
              const imgRes = await getProductImagesWithSas(item.productSkuId);
              const primary = imgRes.find((img) => img.isPrimary);
              if (primary) imageUrl = primary.imageUrl;
            } catch {}
            return {
              id: `${orderId}-${index}`,
              product_name: item.productName || "N/A",
              sku: item.productSkuId || "N/A",
              image: imageUrl,
              quantity: item.quantity || 0,
              unitPrice: item.productPrice || 0,
              totalPrice: item.totalItemPrice || 0,
              size: item.productSize || "",
              color: item.productColor || "",
            };
          }
        )
      );
      dispatch(setOrderItems({ orderId, items }));
    } catch {
      message.error("Failed to load order details.");
    }
  };

  const toggleExpand = (id) => {
    const isExpanding = expanded !== id;
    setExpanded(isExpanding ? id : null);

    const order = filteredOrders.find((o) => o.orderId === id);
    if (isExpanding && order && !order.items) {
      fetchOrderItems(id);
    }
  };

  const statusTag = (status) => {
    const iconMap = {
      Delivered: <CheckCircleOutlined />,
      Shipped: <CarOutlined />,
      Pending: <ClockCircleOutlined />,
    };
    const colorMap = {
      Delivered: "green",
      Shipped: "blue",
      Pending: "orange",
    };
    return (
      <Tag
        color={colorMap[status] || "default"}
        icon={iconMap[status] || <ShoppingCartOutlined />}
        style={{ fontWeight: 600, fontSize: 14, padding: "4px 10px" }}
      >
        {status}
      </Tag>
    );
  };

  return (
    <div style={{ padding: "24px 16px", maxWidth: 960, margin: "0 auto" }}>
      <Title
        level={3}
        style={{ marginBottom: 24, color: "#000000", textAlign: "center" }}
      >
        My Orders
      </Title>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "60px auto" }} />
      ) : (
        <>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {paginatedOrders.length === 0 && (
              <Text type="secondary" style={{ fontSize: 16 }}>
                No completed or shipped orders found.
              </Text>
            )}

            {paginatedOrders.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  hoverable
                  onClick={() => toggleExpand(order.orderId)}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                  }}
                  bodyStyle={{ padding: "20px" }}
                  bordered={false}
                >
                  <Row gutter={[12, 12]} align="middle" justify="space-between">
                    {/* Left side */}
                    <Col xs={24} sm={16}>
                      <Text strong style={{ fontSize: 15 }}>
                        {`Order #${order.orderId}`}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </Text>
                    </Col>

                    {/* Right side */}
                    <Col
                      xs={24}
                      sm={8}
                      style={{
                        textAlign: "right",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "10px",
                          width: "100%",
                        }}
                      >
                        {statusTag(order.status)}
                        <Button
                          type="primary"
                          size="small"
                          style={{
                            borderRadius: 6,
                            backgroundColor: "#000000",
                            borderColor: "#000000",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/order-tracking/${order.orderId}`);
                          }}
                        >
                          Track Order
                        </Button>
                      </div>

                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          color: "#000000",
                        }}
                      >
                        ${order.totalAmount.toFixed(2)}
                      </div>

                      <motion.div
                        animate={{
                          rotate: expanded === order.orderId ? 180 : 0,
                        }}
                        transition={{ duration: 0.25 }}
                        style={{ marginTop: 4 }}
                      >
                        <DownOutlined
                          style={{ fontSize: 18, color: "#000000" }}
                        />
                      </motion.div>
                    </Col>
                  </Row>

                  {/* Expanded details */}
                  <AnimatePresence initial={false}>
                    {expanded === order.orderId && order.items?.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Divider style={{ margin: "16px 0" }} />
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: "100%" }}
                        >
                          {order.items.map((item) => (
                            <Card
                              key={item.id}
                              type="inner"
                              size="small"
                              style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                                backgroundColor: "#fafafa",
                              }}
                              bodyStyle={{ padding: 16 }}
                            >
                              <Row gutter={[12, 12]} align="middle">
                                <Col xs={24} sm={16} md={18}>
                                  <Space size="middle" align="center">
                                    <Image
                                      width={64}
                                      src={item.image}
                                      alt={item.product_name}
                                      style={{
                                        borderRadius: 8,
                                        objectFit: "cover",
                                      }}
                                      preview={false}
                                      fallback="/placeholder.png"
                                    />
                                    <div>
                                      <Text strong style={{ fontSize: 15 }}>
                                        {item.product_name}
                                      </Text>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                      >
                                        SKU: {item.sku}
                                      </Text>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                      >
                                        Size: {item.size || "N/A"}
                                      </Text>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                      >
                                        Color: {item.color || "N/A"}
                                      </Text>
                                    </div>
                                  </Space>
                                </Col>
                                <Col
                                  xs={24}
                                  sm={8}
                                  md={6}
                                  style={{ textAlign: "right" }}
                                >
                                  <Text style={{ fontSize: 14 }}>
                                    Quantity: {item.quantity}
                                  </Text>
                                  <br />
                                  <Text style={{ fontSize: 14 }}>
                                    Price(per item): $
                                    {item.unitPrice.toFixed(2)}
                                  </Text>
                                  <br />
                                  <Text
                                    strong
                                    style={{ fontSize: 16, color: "#000000" }}
                                  >
                                    Total: ${item.totalPrice.toFixed(2)}
                                  </Text>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                        </Space>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </Space>

          {/* Pagination */}
          <Pagination
            current={page}
            total={filteredOrders.length}
            pageSize={pageSize}
            onChange={(p) => setPage(p)}
            style={{
              marginTop: 32,
              textAlign: "center",
              display: Flex,
              justifyContent: "center",
            }}
            showSizeChanger={false}
            size="default"
          />
        </>
      )}
    </div>
  );
};

export default OrderHistory;
