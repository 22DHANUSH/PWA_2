import { Collapse, Checkbox, Slider, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useProducts } from "../../ProductContext";
import { getBrands, getCategories } from "../../products.api";

const { Panel } = Collapse;

function ProductFilter() {
  const { filters, setFilters } = useProducts();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [bRes, cRes] = await Promise.all([
          getBrands(),
          getCategories(1, 20),
        ]);
        setBrands(bRes || []);
        setCategories(cRes || []);
      } catch (err) {
        console.error("Error loading brands/categories:", err);
      }
    }
    fetchMeta();
  }, []);

  const resetFilters = () => {
    const clearedFilters = {
      categoryIds: [],
      brandIds: [],
      colors: [],
      sizes: [],
      genders: [],
      minPrice: 0,
      maxPrice: 500,
      searchTerm: "",
    };
    setFilters(clearedFilters);
  };

  const updateFilter = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const newFilters = { ...filters, [key]: updated };
    setFilters(newFilters);
  };

  const handlePriceChange = ([min, max]) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
  };

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
  const colorOptions = [
    { name: "Black", hex: "#000000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Red", hex: "#FF0000" },
    { name: "Green", hex: "#008000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Gray", hex: "#808080" },
  ];
  const genderOptions = ["Men", "Women", "Unisex"];

  const renderCheckboxGroup = (key, items, itemKey, itemLabel) => {
    if (key === "colors") {
      return (
        <Row gutter={[8, 8]}>
          {items.map((item) => {
            const value = item.name;
            const isSelected = (filters[key] || []).includes(value);
            return (
              <Col span={6} key={value}>
                <div
                  onClick={() => updateFilter("colors", value)}
                  style={{
                    cursor: "pointer",
                    border: isSelected ? "2px solid #1890ff" : "1px solid #ccc",
                    borderRadius: 8,
                    padding: 8,
                    textAlign: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      margin: "0 auto 6px",
                      borderRadius: "50%",
                      backgroundColor: item.hex,
                      border: "1px solid #999",
                    }}
                  />
                  <span style={{ fontSize: 12 }}>{item.name}</span>
                </div>
              </Col>
            );
          })}
        </Row>
      );
    }

    return (
      <Row gutter={[8, 8]}>
        {items.map((item) => {
          const value = itemKey ? item[itemKey] : item;
          const label = itemLabel ? item[itemLabel] : item;
          const isSelected = (filters[key] || []).includes(value);
          return (
            <Col span={24} key={value}>
              <Checkbox
                checked={isSelected}
                onChange={() => updateFilter(key, value)}
              >
                {label}
              </Checkbox>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 12,
        }}
      >
        <a
          onClick={resetFilters}
          style={{ color: "#1890ff", cursor: "pointer" }}
        >
          Reset All Filters
        </a>
      </div>

      <Collapse defaultActiveKey={["categoryIds", "brandIds", "price"]}>
        <Panel header="Category" key="categoryIds">
          {renderCheckboxGroup(
            "categoryIds",
            categories,
            "categoryId",
            "categoryName"
          )}
        </Panel>
        <Panel header="Brand" key="brandIds">
          {renderCheckboxGroup("brandIds", brands, "brandId", "brandName")}
        </Panel>
        <Panel header="Size" key="sizes">
          {renderCheckboxGroup("sizes", sizeOptions)}
        </Panel>
        <Panel header="Gender" key="genders">
          {renderCheckboxGroup("genders", genderOptions)}
        </Panel>
        <Panel header="Price" key="price">
          <Slider
            range
            min={0}
            max={500}
            step={10}
            value={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
            onChange={handlePriceChange}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>${filters.minPrice ?? 0}</span>
            <span>${filters.maxPrice ?? 500}</span>
          </div>
        </Panel>
      </Collapse>
    </>
  );
}

export default ProductFilter;
