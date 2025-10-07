import React from "react";
import { Typography, Divider } from "antd";

const { Title, Text, Paragraph } = Typography;

const ProductInfo = ({ product, price }) => (
  <div style={{ paddingBottom: "1.5rem" }}>
    <Title level={2} style={{ marginBottom: 4 }}>
      {product.productName}
    </Title>

    <Text
      type="secondary"
      style={{ display: "block", marginBottom: 12, fontSize: 14 }}
    >
      {product.productSummary}
    </Text>

    <Divider style={{ margin: "12px 0", backgroundColor: "black" }} />

    <Paragraph style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
      {product.productDescription}
    </Paragraph>
  </div>
);

export default ProductInfo;
