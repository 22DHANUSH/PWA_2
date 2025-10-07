import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Image,
  Typography,
  Pagination,
  Spin,
  message,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  getWishlistItems,
  getProductImagesWithSas,
  deleteWishlistItem,
} from "./../../users.api";
import {
  getProductById,
  getProductSkuById,
} from "./../../../Products/products.api";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import "./../../WishlistItems/WishlistItems.css";

import { addToCartFlow } from "../../../Cart/cart.api";
import { useCart } from "../../../Cart/CartContext";

const { Title, Text } = Typography;

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const { refreshCartCount } = useCart();

  const fetchWishlist = async (page = 1) => {
    try {
      setLoading(true);
      const items = await getWishlistItems(userId, page, pageSize);
      setTotal(items.length < pageSize ? page * pageSize : page * pageSize + 1);

      const enriched = await Promise.all(
        items.map(async (item) => {
          const sku = await getProductSkuById(item.productSkuId);
          const product = await getProductById(sku.productId);
          const images = await getProductImagesWithSas(item.productSkuId);
          const primaryImage = images.find((img) => img.isPrimary) || images[0];

          return {
            ...item,
            productId: product.productId,
            productName: product.productName,
            productPrice: sku.productPrice,
            productImage: primaryImage ? primaryImage.imageUrl : "",
          };
        })
      );

      setWishlist(enriched);
    } catch (err) {
      console.error(err);
      message.error("Failed to Load Wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (wishlistItemId, e) => {
    e.stopPropagation();
    try {
      await deleteWishlistItem(wishlistItemId);
      message.success("Removed from wishlist");
      setWishlist((prev) =>
        prev.filter((item) => item.wishlistItemId !== wishlistItemId)
      );
    } catch (err) {
      console.error(err);
      message.error("Failed to Remove Wishlist Item");
    }
  };

  const handleAddToCart = async (item, e) => {
    e.stopPropagation();
    try {
      setLoadingAdd(item.productSkuId);
      await addToCartFlow(userId, item.productSkuId, 1);
      message.success("Added to cart!");
      await refreshCartCount();
    } catch (err) {
      console.error("Add to cart failed:", err);
      message.error("Failed to add to cart");
    } finally {
      setLoadingAdd(null);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWishlist(pageNumber);
    }
  }, [pageNumber, userId]);

  return (
    <div className="wishlist-container">
      <Title level={2} className="wishlist-title">
        My Wishlist
      </Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Row gutter={[16, 16]} className="wishlist-row">
            {wishlist.map((item) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                xl={6}
                key={item.wishlistItemId}
              >
                <div
                  className="wishlist-card"
                  onClick={() =>
                    navigate(
                      `/productdetails/${item.productId}/${item.productSkuId}`
                    )
                  }
                >
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    className="wishlist-image"
                    preview={false}
                  />
                  <div className="wishlist-details">
                    <Text className="product-title">{item.productName}</Text>
                    <Text type="secondary">{item.productPrice}</Text>
                  </div>

                  <div className="wishlist-remove">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleRemove(item.wishlistItemId, e)}
                    />

                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      loading={loadingAdd === item.productSkuId}
                      onClick={(e) => handleAddToCart(item, e)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <div className="wishlist-pagination">
            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={total}
              onChange={(page) => setPageNumber(page)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
