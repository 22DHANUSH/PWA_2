import { Card, Row, Col, Spin, Table, Tag, Empty } from "antd";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  fetchTopRevenueProducts,
  fetchRevenueByCategory,
} from "../insightsapi";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RevenuePerformancePanel() {
  const [topProducts, setTopProducts] = useState([]);
  const [categoryRevenue, setCategoryRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        const [products, categories] = await Promise.all([
          fetchTopRevenueProducts(),
          fetchRevenueByCategory(),
        ]);
        setTopProducts(products || []);
        setCategoryRevenue(categories || []);
      } catch (error) {
        console.error("Failed to load revenue data", error);
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  const productColumns = [
    {
      title: "#",
      render: (_, __, index) => <strong>{index + 1}</strong>,
    },
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => (
        <Tag
          color={value > 100000 ? "gold" : value > 50000 ? "green" : "volcano"}
        >
          ${value.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Units Sold",
      dataIndex: "unitsSold",
      key: "unitsSold",
    },
  ];

  const donutLabels = categoryRevenue.map((item) => item.categoryName);
  const donutValues = categoryRevenue.map((item) => item.categoryRevenue);

  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    cutout: "50%",
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed}`,
        },
      },
      legend: {
        position: "top",
      },
    },
  };

  return (
    <Card title="💰 Revenue & Sales Performance" style={{ marginBottom: 24 }}>
      {loading ? (
        <Spin />
      ) : (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="📊 Revenue by Category"
              bodyStyle={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {categoryRevenue.length > 0 ? (
                <Doughnut data={donutData} options={donutOptions} />
              ) : (
                <Empty description="No category data available" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              type="inner"
              title="🏆 Top Revenue-Generating Products"
              bodyStyle={{ height: 400, overflowY: "auto" }}
            >
              <Table
                rowKey="productId"
                columns={productColumns}
                dataSource={topProducts}
                pagination={false}
                locale={{ emptyText: "No product data available" }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
}
