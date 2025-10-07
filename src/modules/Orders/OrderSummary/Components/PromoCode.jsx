import React, { useEffect, useState } from "react";
import { Card, Button, Typography, List, message, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Discount_api from "../../../../app/Discount_api";
import Discount_Function_api from "../../../../app/Discount_Function_api";

const { Title, Text } = Typography;

const PromoCode = ({ onApply, skuIds, subtotal }) => {
  const [discounts, setDiscounts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!skuIds || skuIds.length === 0) return;

    const payload = { productSkuId: skuIds };

    Discount_api.post("discounts/discountData", payload)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        const uniqueDiscountsMap = new Map();
        data.forEach((discount) => {
          if (
            discount.code &&
            !uniqueDiscountsMap.has(discount.code) &&
            discount.isActive !== false &&
            new Date(discount.validTo || "2099-12-31") > new Date()
          ) {
            uniqueDiscountsMap.set(discount.code, discount);
          }
        });

        setDiscounts(Array.from(uniqueDiscountsMap.values()));
      })
      .catch(() => message.error("Failed to load discounts"));
  }, [skuIds]);

  const handleApply = async (discount) => {
    setSelectedId(discount.discountId);

    try {
      const response = await Discount_Function_api.post("calculate-discount", {
        productSkuId: [discount.productSkuId],
        totalPrice: subtotal,
        discountCode: discount.code,
      });

      const discountAmount = response.data.DiscountAmount;
      const totalAfterDiscount = response.data.FinalPrice;

      onApply({ discount, discountAmount, totalAfterDiscount });

      message.success(`Applied ${discount.code}`);
    } catch (error) {
      console.error("Discount calculation failed:", error);
      message.error("Failed to apply discount");
    }
  };

  const handleRemove = () => {
    setSelectedId(null);
    onApply({ discount: null, discountAmount: 0, totalAfterDiscount: subtotal });
    message.info("Discount removed");
  };

  return (
    <Card title={<Title level={4}>Available Discounts</Title>} style={{ marginTop: 20 }}>
      <List
        itemLayout="horizontal"
        dataSource={discounts}
        renderItem={(discount) => {
          const isApplied = selectedId === discount.discountId;
          return (
            <List.Item
              style={{
                borderBottom: "1px solid #eee",
                padding: "12px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Space direction="vertical">
                <Text strong>{discount.code}</Text>
                <Text>{discount.discountDescription}</Text>
                <Text type="secondary">
                  {discount.discountPercent > 0
                    ? `${discount.discountPercent}% off`
                    : `$${discount.discountAmount} off`}
                </Text>
              </Space>
              {isApplied ? (
                <Button icon={<CloseOutlined />} onClick={handleRemove}>
                  Remove
                </Button>
              ) : (
                <Button icon={<CheckOutlined />} onClick={() => handleApply(discount)}>
                  Apply
                </Button>
              )}
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default PromoCode;