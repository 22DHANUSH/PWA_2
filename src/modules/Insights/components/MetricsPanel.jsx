import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Select,
  Typography,
  Space,
  Table,
  Input,
  Statistic,
} from "antd";
import ChartRenderer from "./ChartRenderer";
import { fetchProductSeries } from "../insightsapi";
const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;
import FunnelChart from "./FunnelChart";
import KpiSummaryPanel from "./KpiSummaryPanel";
import LowConversionPanel from "./LowConversionPanel";
import RevenuePerformancePanel from "./RevenuePerformancePanel";

export default function MetricsPanel() {
  // const [metrics, setMetrics] = useState({});
  const [series, setSeries] = useState([]);
  const [granularity, setGranularity] = useState("daily");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadSeries() {
      const data = await fetchProductSeries(granularity);
      setSeries(data);
      if (data.length > 0 && selectedProducts.length === 0) {
        setSelectedProducts(data.slice(0, 5).map((p) => p.productName));
      }
    }

    loadSeries();
  }, [granularity]);

  const filteredData = series.filter((p) =>
    p.productName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: (
        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Col>
            <span>Product</span>
          </Col>
          <Col>
            <Search
              placeholder="Search"
              allowClear
              size="small"
              onSearch={(val) => setSearchText(val)}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 180 }}
            />
          </Col>
        </Row>
      ),
      dataIndex: "productName",
      key: "productName",
    },
    { title: "Views", dataIndex: "totalViews", key: "views" },
    { title: "Add To Cart", dataIndex: "totalAddToCart", key: "addToCart" },
    { title: "Purchases", dataIndex: "totalPurchases", key: "purchases" },
    { title: "Revenue", dataIndex: "totalRevenue", key: "revenue" },
  ];

  return (
    <Space
      direction="vertical"
      size="large"
      style={{
        // maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        width: "100%",
      }}
    >
      <Title level={3}>Smart Insights Dashboard</Title>
      <KpiSummaryPanel />
      <RevenuePerformancePanel />

      <FunnelChart />

      <Card
        style={{
          paddingBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 8,
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  Product Views Over Time
                </Title>
              </Col>
              <Col>
                <Select
                  value={granularity}
                  onChange={(value) => setGranularity(value)}
                  style={{ width: 120 }}
                >
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                </Select>
              </Col>
            </Row>

            <div style={{ width: "100%", minHeight: 300 }}>
              <ChartRenderer
                data={series.filter((p) =>
                  selectedProducts.includes(p.productName)
                )}
              />
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                height: 420,
                overflowY: "auto",
              }}
            >
              <Table
                rowKey="productName"
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 8 }}
                rowSelection={{
                  type: "checkbox",
                  selectedRowKeys: selectedProducts,
                  onChange: (keys) => {
                    if (keys.length <= 5) setSelectedProducts(keys);
                  },
                  getCheckboxProps: (record) => ({
                    disabled:
                      selectedProducts.length >= 5 &&
                      !selectedProducts.includes(record.productName),
                  }),
                }}
                rowClassName={(record) =>
                  selectedProducts.includes(record.productName)
                    ? "selected-row"
                    : ""
                }
                size="small"
              />
            </div>
          </Col>
        </Row>
      </Card>

      <style>{`
        .ant-table-row-selected {
          background-color: #e6f7ff !important;
          color: #000 !important;
        }

        .ant-table-row-selected td {
          background-color: #e6f7ff !important;
          color: #000 !important;
        }

        .ant-table-row:hover td {
          background-color: #f5f5f5 !important;
        }
      `}</style>

      <LowConversionPanel />
    </Space>
  );
}
