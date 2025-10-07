import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Typography,
  Spin,
  Drawer,
  Tabs,
  Tag,
  Input,
  Divider,
  message,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Column } from "@ant-design/charts";
import {
  fetchLowConversionProducts,
  generateProductInsight,
} from "../insightsapi";

const { Paragraph } = Typography;

export default function LowConversionPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({});
  const [generating, setGenerating] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      const data = await fetchLowConversionProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const handleGenerateInsight = async (product) => {
    setGenerating((prev) => ({ ...prev, [product.productId]: true }));

    const payload = {
      category: "Product",
      data: {
        ProductId: product.productId,
        ProductName: product.productName,
        Views: product.views,
        AddToCart: product.addToCart,
        Purchases: product.purchases,
        Region: "Unknown",
      },
    };

    const result = await generateProductInsight(payload);
    setInsights((prev) => ({
      ...prev,
      [product.productId]: result.insight,
    }));
    setGenerating((prev) => ({ ...prev, [product.productId]: false }));
    setSelectedProduct(product);
    setDrawerVisible(true);
  };

  const getInsightSections = (rawText) => {
    if (!rawText || typeof rawText !== "string") return null;
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const getSection = (title) => {
      const start = lines.findIndex((line) => line.startsWith(title));
      if (start === -1) return [];
      const nextHeader = lines.findIndex(
        (line, i) => i > start && /^[A-Z]/.test(line)
      );
      const end = nextHeader !== -1 ? nextHeader : lines.length;
      return lines.slice(start + 1, end);
    };

    return {
      funnel: getSection("Funnel Performance:"),
      issues: getSection("Issues Identified:"),
      actions: getSection("Recommended Actions:"),
      notes: [...new Set(getSection("Additional Considerations:"))],
    };
  };

  const renderInsightTabs = (sections) => {
    const tabs = [
      {
        key: "funnel",
        label: "Funnel Performance",
        children: (
          <ul>
            {sections.funnel.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ),
      },
      {
        key: "issues",
        label: "Issues Identified",
        children: (
          <ul>
            {sections.issues.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ),
      },
      {
        key: "actions",
        label: "Recommended Actions",
        children: (
          <ul>
            {sections.actions.map((line, i) => (
              <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
            ))}
          </ul>
        ),
      },
    ];

    if (sections.notes.length > 0) {
      tabs.push({
        key: "notes",
        label: "Additional Considerations",
        children: (
          <ul>
            {sections.notes.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        ),
      });
    }

    return <Tabs defaultActiveKey="funnel" items={tabs} />;
  };

  const renderFunnelChart = (product) => {
    const data = [
      { stage: "Views", value: product.views },
      { stage: "Add to Cart", value: product.addToCart },
      { stage: "Purchases", value: product.purchases },
    ];

    return (
      <Column
        data={data}
        xField="stage"
        yField="value"
        height={300}
        width={400}
        columnWidthRatio={0.4}
        color="#1890ff"
        label={{
          position: "middle",
          style: { fill: "#fff", fontWeight: 500 },
        }}
        xAxis={{ label: { autoHide: false, autoRotate: true } }}
        yAxis={{ title: { text: "Count" } }}
      />
    );
  };

  const getSection = (text, title) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const start = lines.findIndex((line) => line.startsWith(title));
    if (start === -1) return "";
    const nextHeader = lines.findIndex(
      (line, i) => i > start && /^[A-Z]/.test(line)
    );
    const end = nextHeader !== -1 ? nextHeader : lines.length;
    return lines.slice(start + 1, end).join("\n");
  };

  const generateMissingInsights = async () => {
    const missingIds = selectedRowKeys.filter((id) => !insights[id]);
    const newInsights = {};

    await Promise.all(
      missingIds.map(async (id) => {
        const product = products.find((p) => p.productId === id);
        if (!product) return;
        const payload = {
          category: "Product",
          data: {
            ProductId: product.productId,
            ProductName: product.productName,
            Views: product.views,
            AddToCart: product.addToCart,
            Purchases: product.purchases,
            Region: "Unknown",
          },
        };
        const result = await generateProductInsight(payload);
        newInsights[id] = result.insight;
      })
    );

    setInsights((prev) => ({ ...prev, ...newInsights }));
    return newInsights; // 👈 return for immediate use
  };

  const handleExportSelectedWithAutoGenerate = async () => {
    const missingIds = selectedRowKeys.filter((id) => !insights[id]);

    let newInsights = {};
    if (missingIds.length > 0) {
      message.info(
        `Generating insights for ${missingIds.length} product(s)...`
      );
      newInsights = await generateMissingInsights();
      message.success("All insights generated. Exporting now...");
    }

    const allInsights = { ...insights, ...newInsights };
    exportSelectedInsights(allInsights); // 👈 use latest insights directly
  };
  const exportSelectedInsights = (insightMap) => {
    const selectedInsights = selectedRowKeys
      .map((id) => {
        const text = insightMap[id];
        if (!text) return null;
        const product = products.find((p) => p.productId === id);
        const name = product?.productName || "";
        return [
          id,
          name,
          getSection(text, "Funnel Performance:"),
          getSection(text, "Issues Identified:"),
          getSection(text, "Recommended Actions:"),
          getSection(text, "Additional Considerations:"),
        ].map(
          (field) =>
            `"${String(field)
              .replace(/"/g, '""')
              .replace(/\r?\n/g, "\n")
              .replace(/^=/, "'=")
              .trim()}"`
        );
      })
      .filter(Boolean);

    if (selectedInsights.length === 0) {
      message.warning("No insights available for selected products.");
      return;
    }

    const csv = [
      [
        "Product ID",
        "Product Name",
        "Funnel Performance",
        "Issues Identified",
        "Recommended Actions",
        "Additional Considerations",
      ],
      ...selectedInsights,
    ]
      .map((row) => row.join(","))
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected_product_insights.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Product</span>
          <Input
            placeholder="Search"
            allowClear
            size="medium"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
      ),
      dataIndex: "productName",
      key: "name",
      render: (text) => <strong>{text}</strong>,
    },
    { title: "Views", dataIndex: "views", key: "views" },
    { title: "Purchases", dataIndex: "purchases", key: "purchases" },
    {
      title: "Conversion",
      key: "conversionRate",
      render: (_, record) => (
        <Tag color={record.conversionRate === 0 ? "volcano" : "green"}>
          {record.conversionRate}%
        </Tag>
      ),
    },
    {
      title: "Insight",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleGenerateInsight(record)}
          loading={generating[record.productId]}
        >
          View Insight
        </Button>
      ),
    },
  ];

  const selectedInsight = selectedProduct
    ? insights[selectedProduct.productId]
    : null;

  return (
    <>
      <Card
        title="📉 High Views, Low Conversion"
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportSelectedWithAutoGenerate}
              type="primary"
              disabled={selectedRowKeys.length === 0}
            >
              Export Selected
            </Button>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {loading ? (
          <Spin />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              rowKey="productId"
              columns={columns}
              dataSource={filteredProducts}
              pagination={{ pageSize: 5 }}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                preserveSelectedRowKeys: true,
              }}
            />
          </div>
        )}
      </Card>

      <Drawer
        title={`🧠 Insight for ${selectedProduct?.productName}`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedProduct && (
          <>
            <Paragraph>
              <strong>Funnel Chart:</strong>
            </Paragraph>
            {renderFunnelChart(selectedProduct)}
            <Divider />
            {selectedInsight ? (
              renderInsightTabs(getInsightSections(selectedInsight))
            ) : (
              <Paragraph type="warning">No insight available.</Paragraph>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
