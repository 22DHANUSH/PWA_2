import React, { useEffect, useState } from "react";
import { Collapse, List, Typography, Spin, Alert, Card } from "antd";
import { fetchRecommendations } from "../insightsapi";

const { Panel } = Collapse;
const { Title } = Typography;

const ColumbiaRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const data = await fetchRecommendations();
        const insightText = data?.insights?.trim();
        if (insightText && insightText.length > 0) {
          setRecommendations(insightText);
        } else {
          setRecommendations("No recommendations available.");
        }
      } catch (err) {
        setError("Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  if (loading || recommendations === null)
    return (
      <Spin tip="Loading recommendations..." size="large" className="mt-6" />
    );

  if (error)
    return <Alert message={error} type="error" showIcon className="mt-6" />;

  // Split by numbered sections "1.", "2.", etc.
  const sectionsRaw = recommendations.split(/\n(?=\d+\.\s)/).filter(Boolean);
  const sectionTitles = [
    "Fabrics to Focus On",
    "Colors and Palettes",
    "Designs and Styles",
    "Weather, Trend, or Sustainability Considerations",
  ];

  const sectionData = sectionsRaw.map((section, idx) => {
    const bullets = section
      .split(/\n\s*-\s+/) // split by bullet points
      .slice(1) // remove the section header line
      .map((b) => b.replace(/\r/g, "").trim())
      .filter((b) => b !== "");

    return {
      title: sectionTitles[idx] || `Section ${idx + 1}`,
      bullets: bullets.length ? bullets : ["No recommendations available."],
    };
  });

  return (
    <Card
      title={<Title level={3}>Future Recommendations</Title>}
      className="max-w-5xl mx-auto mt-6"
      bordered={false}
      hoverable
    >
      <Collapse accordion>
        {sectionData.map((section, idx) => (
          <Panel header={section.title} key={idx}>
            <List
              dataSource={section.bullets}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta description={item} />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </Card>
  );
};

export default ColumbiaRecommendations;
