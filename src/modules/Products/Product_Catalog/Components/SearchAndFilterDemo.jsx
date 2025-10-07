import { Row, Col, Button, Drawer } from "antd";
import SearchBar from "./SearchBar";
import ProductFilter from "./ProductFilter";
import ProductsPage from "../../../Products/Product_Catalog/Pages/ProductsPage";
import { useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import "../SearchAndFilterDemo.css";

function SearchAndFilterDemo() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          icon={<FilterOutlined />}
          onClick={() => setDrawerVisible(true)}
          className="filter-btn-mobile"
        >
          Filters
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ padding: 24 }}>
        {/* Desktop Sidebar */}
        <Col xs={0} sm={0} md={6} lg={6} xl={6}>
          <ProductFilter />
        </Col>

        {/* Product Section */}
        <Col xs={24} sm={24} md={18} lg={18} xl={18}>
          <SearchBar />
          <ProductsPage />
        </Col>
      </Row>

      {/* Mobile Drawer for Filters */}
      <Drawer
        title={null}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: "none" }} // hide default header
      >
        <div className="mobile-filter-header">
          <span className="title">Filters</span>
        </div>

        <div className="mobile-filter-body">
          <ProductFilter />
        </div>
      </Drawer>
    </>
  );
}

export default SearchAndFilterDemo;
