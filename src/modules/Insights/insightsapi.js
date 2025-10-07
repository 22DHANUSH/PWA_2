import analytics_api from "../../app/analytics.axios";

export async function fetchFunnelData() {
  const response = await analytics_api.get("analytics/funnel/purchase");
  return response.data;
}

export async function fetchProductSeries(granularity) {
  const response = await analytics_api.get(
    `analytics/products/timeseries-multi?granularity=${granularity}`
  );
  return response.data;
}

export async function fetchFunnelInsights() {
  const response = await analytics_api.get("Insights/funnel/purchase/insights");
  return response.data;
}

export async function fetchKpiSummary() {
  const response = await analytics_api.get("analytics/kpi-trends");
  return response.data;
}

export async function fetchLowConversionProducts() {
  const response = await analytics_api.get("Insights/low-conversion");
  return response.data;
}

export async function generateProductInsight(payload) {
  const response = await analytics_api.post("Insights/generate", payload);
  return response.data;
}

export async function fetchTopRevenueProducts() {
  const response = await analytics_api.get("analytics/top-products");
  return response.data;
}

export async function fetchRevenueByCategory() {
  const response = await analytics_api.get("analytics/by-category");
  return response.data;
}

export async function fetchRecommendations() {
  const response = await analytics_api.get("Insights/columbia-recommendations");
  return response.data;
}

export async function fetchStores() {
  const response = await analytics_api.get("Stores");
  return response.data;
}
