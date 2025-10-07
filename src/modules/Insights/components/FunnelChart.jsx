import React, { useEffect, useState } from "react";
import { Card, Spin, Button, Typography, Row, Col } from "antd";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchFunnelData, fetchFunnelInsights } from "../insightsapi";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);
const { Title, Paragraph } = Typography;

export default function FunnelChart() {
  const [funnel, setFunnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    async function loadFunnel() {
      const data = await fetchFunnelData();
      setFunnel(data || []);
      setLoading(false);
    }
    loadFunnel();
  }, []);

  const handleGenerateInsights = async () => {
    setInsightLoading(true);
    const result = await fetchFunnelInsights();
    const lines = result.split("\n").filter((line) => line.trim() !== "");
    setInsights(lines);
    setInsightLoading(false);
  };

  const chartData = {
    labels: funnel.map((step) => step.stepName),
    datasets: [
      {
        label: "Users",
        data: funnel.map((step) => step.userCount),
        backgroundColor: "#1890ff",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "x",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { beginAtZero: true },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const step = funnel[context.dataIndex];
            return `Users: ${step.userCount}, ${step.percentage}% of start, ${step.abandonmentRate}% drop`;
          },
        },
      },
    },
  };

  // ✅ Custom connector plugin
  const connectorPlugin = {
    id: "funnelConnectors",
    afterDatasetsDraw(chart) {
      const {
        ctx,
        chartArea: { top },
        scales: { x, y },
      } = chart;
      const dataset = chart.getDatasetMeta(0).data;

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#1890ff";

      for (let i = 0; i < dataset.length - 1; i++) {
        const curr = dataset[i];
        const next = dataset[i + 1];
        if (!curr || !next) continue;

        // Get top-right of current bar
        const p1 = { x: curr.x + curr.width / 2, y: curr.y };
        // Get top-left of next bar
        const p2 = { x: next.x - next.width / 2, y: next.y };

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p2.x, chart.chartArea.bottom);
        ctx.lineTo(p1.x, chart.chartArea.bottom);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    },
  };

  return (
    <Row gutter={24}>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Card title="Purchase Journey Funnel" style={{ height: 400 }}>
          {loading ? (
            <Spin />
          ) : (
            <div style={{ height: 300 }}>
              <Bar
                data={chartData}
                options={options}
                plugins={[connectorPlugin]}
              />
            </div>
          )}
        </Card>
      </Col>

      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Card
          style={{
            height: 400,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {insights.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="primary"
                onClick={handleGenerateInsights}
                loading={insightLoading}
                style={{ width: "60%" }}
              >
                Generate Insights
              </Button>
            </div>
          ) : (
            <>
              <Title level={4} style={{ marginBottom: 16 }}>
                Insights Generated
              </Title>
              <div
                style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}
              >
                <Typography>
                  {insights
                    .reduce((acc, curr, i, arr) => {
                      if (curr.startsWith("Insight")) {
                        const next = arr[i + 1] || "";
                        acc.push(`${curr} ${next}`);
                      }
                      return acc;
                    }, [])
                    .map((line, i) => {
                      const match = line.match(
                        /^(Insight \d+):\s*(🔻|✅|📉|👥)\s+(.*?)(?:\s+—\s+)(.*)$/
                      );

                      if (match) {
                        const [, label, icon, description, recommendation] =
                          match;
                        return (
                          <Paragraph key={i} style={{ marginBottom: 16 }}>
                            <strong>{label}</strong>
                            <br />
                            <span style={{ marginRight: 6 }}>{icon}</span>
                            {description.trim()} —{" "}
                            <strong>{recommendation.trim()}</strong>
                          </Paragraph>
                        );
                      }

                      return (
                        <Paragraph key={i} style={{ marginBottom: 16 }}>
                          {line}
                        </Paragraph>
                      );
                    })}
                </Typography>
              </div>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
}
