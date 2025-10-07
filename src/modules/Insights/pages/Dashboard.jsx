import MetricsPanel from "../components/MetricsPanel";
import ColumbiaRecommendations from "../components/Recommendations";
import { useState } from "react";

export default function Dashboard() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [insight, setInsight] = useState("");

  return (
    <div className="dashboard">
      {/* <h2>Smart Insights Dashboard</h2> */}
      <MetricsPanel />
      <ColumbiaRecommendations />
    </div>
  );
}
