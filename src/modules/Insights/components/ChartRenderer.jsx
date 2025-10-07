import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function ChartRenderer({ data }) {
  if (!Array.isArray(data) || data.length === 0)
    return <p>No chart data available</p>;

  // Extract all unique periods (x-axis labels)
  const allPeriods = [
    ...new Set(data.flatMap((p) => p.series.map((s) => s.period))),
  ];

  const chartData = {
    labels: allPeriods,
    datasets: data.map((product, index) => ({
      label: product.productName,
      data: allPeriods.map((period) => {
        const match = product.series.find((s) => s.period === period);
        return match ? match.views : 0;
      }),
      borderColor: getColor(index),
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom", // 👈 move labels to bottom
        labels: {
          usePointStyle: false, // round dots instead of boxes
          boxWidth: 20,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: "370px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Simple color palette
function getColor(index) {
  const colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8"];
  return colors[index % colors.length];
}
