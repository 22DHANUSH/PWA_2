import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { fetchKpiSummary } from "../insightsapi";

const { Title } = Typography;

export default function KpiSummaryPanel() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadKpis() {
      const data = await fetchKpiSummary();
      setMetrics(data);
    }
    loadKpis();
  }, []);

  const renderMetricCard = (
    title,
    value,
    change = null,
    prefix = "",
    precision = 2
  ) => {
    const isUp = change !== null && change >= 0;
    const changeColor = isUp ? "#3f8600" : "#cf1322";
    const arrow = isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />;

    return (
      <Card bordered={true} style={{ height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 14, color: "#888" }}>{title}</span>
          {change !== null && (
            <span style={{ fontSize: 14, color: changeColor }}>
              {arrow} {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
        <div style={{ fontSize: 24, color: "#000", fontWeight: 500 }}>
          {prefix}
          {typeof value === "number"
            ? parseFloat(value.toFixed(precision)).toLocaleString()
            : value}
        </div>
      </Card>
    );
  };

  if (!metrics) return null;

  return (
    <Card
      style={{
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        borderRadius: 8,
      }}
      bodyStyle={{ padding: "16px 24px" }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        📈 Business KPIs
      </Title>
      <Row gutter={[16, 16]} wrap>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          {renderMetricCard("Total Users", metrics.totalUsers, null, "", 0)}
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          {renderMetricCard(
            "Total Products",
            metrics.totalProducts,
            null,
            "",
            0
          )}
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          {renderMetricCard(
            "Top Product Sold",
            `ID ${metrics.topProductId} (${metrics.topProductOrderCount} orders)`,
            null
          )}
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          {renderMetricCard(
            "Revenue ($)",
            metrics.revenue.current,
            metrics.revenue.change,
            "$",
            2
          )}
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          {renderMetricCard(
            "Orders",
            metrics.orders.current,
            metrics.orders.change,
            "",
            0
          )}
        </Col>
      </Row>
    </Card>
  );
}
