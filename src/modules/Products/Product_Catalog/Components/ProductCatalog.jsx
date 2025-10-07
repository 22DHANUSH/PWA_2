// ProductCatalog.jsx
import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Spin,
  Empty,
  Typography,
  Button,
  Pagination,
  message,
} from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useProducts } from "../../ProductContext";
import { useNavigate } from "react-router-dom";
import {
  checkWishlist,
  addWishlistItem,
  deleteWishlistItem,
} from "../../../Users/users.api";
import {
  getCartByUserId,
  createCart,
  addCartItem,
  updateCartItem,
  getCartItemBySku,
} from "../../../Cart/cart.api";
import { useCart } from "../../../Cart/CartContext";
import { Modal } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import ProductOptions from "../../Product_Description/Components/ProductOptions";

const { Title } = Typography;
const getGuestCart = () =>
  JSON.parse(localStorage.getItem("guestCart") || "[]");
const setGuestCart = (items) =>
  localStorage.setItem("guestCart", JSON.stringify(items));
const addToGuestCart = (product, qty = 1) => {
  const sku =
    product.productSkuID ||
    product.productSkuId ||
    product.productSku ||
    product.sku;
  if (!sku) {
    console.warn("addToGuestCart: no SKU found on product", product);
    return;
  }

  const guest = getGuestCart();
  const existing = guest.find((it) => it.productSkuId === sku);

  const priceRaw = product.productPrice ?? product.price ?? "0";
  const productPrice =
    typeof priceRaw === "string" && priceRaw.startsWith("$")
      ? priceRaw
      : `$${priceRaw}`;

  if (existing) {
    existing.quantity = (existing.quantity || 0) + qty;
  } else {
    guest.push({
      productSkuId: sku,
      productId: product.productId,
      productTitle: product.productName || product.productTitle || "",
      productImage:
        product.imageUrl ||
        product.productImage ||
        "https://placehold.co/250x250?text=No+Image",
      productPrice,
      quantity: qty,
      isOutOfStock: !!product.isOutOfStock,
      productSize: product.productSize,
      productColor: product.productColor,
    });
  }
  setGuestCart(guest);
};

function WishlistIcon({ userId, productSkuId }) {
  const [wishlisted, setWishlisted] = React.useState(false);
  const [wishlistItemId, setWishlistItemId] = React.useState(null);

  React.useEffect(() => {
    const fetchWishlistStatus = async () => {
      try {
        const res = await checkWishlist(userId, productSkuId);
        if (res?.isWishlisted) {
          setWishlisted(true);
          setWishlistItemId(res.wishlistItemId);
        }
      } catch (err) {
        console.error("Error checking wishlist:", err);
      }
    };
    fetchWishlistStatus();
  }, [userId, productSkuId]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    try {
      if (wishlisted) {
        await deleteWishlistItem(wishlistItemId);
        setWishlisted(false);
        setWishlistItemId(null);
      } else {
        const res = await addWishlistItem(userId, productSkuId);
        setWishlisted(true);
        setWishlistItemId(res.wishlistItemId);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  return wishlisted ? (
    <HeartFilled
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 20,
        color: "red",
        cursor: "pointer",
      }}
      onClick={toggleWishlist}
    />
  ) : (
    <HeartOutlined
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        fontSize: 20,
        color: "#090909ff",
        cursor: "pointer",
      }}
      onClick={toggleWishlist}
    />
  );
}

function ProductCatalog() {
  const userId = localStorage.getItem("userId");
  const { products, loading, pagination, setPagination, currentUserId } =
    useProducts();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const handleOptionsLoaded = () => {
    setLoadingOptions(false);
  };

  console.log(products);
  const handleBuyNow = (product) => {
    setLoadingOptions(true); // Start spinner
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setSelectedProduct(product); // ✅ Set product directly
    setIsModalVisible(true); // ✅ Show modal immediately
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const sku =
      product.productSkuID ||
      product.productSkuId ||
      product.productSku ||
      product.sku;
    if (!sku) {
      message.error("Product SKU is missing");
      return;
    }

    if (!userId) {
      addToGuestCart(product, 1);
      message.success("Added to cart");
      await refreshCartCount();
      return;
    }
    try {
      let cart = null;
      try {
        const res = await getCartByUserId(userId);
        cart = res.data;
      } catch {
        const res = await createCart(userId);
        cart = res.data;
      }

      let existingItem = null;
      try {
        const res = await getCartItemBySku(cart.cartId, sku);
        existingItem = res.data;
      } catch (err) {
        if (err?.response?.status === 404) {
          existingItem = null;
        } else {
          throw err;
        }
      }

      if (existingItem) {
        await updateCartItem(
          existingItem.cartItemId,
          existingItem.quantity + 1
        );
        message.success("Updated cart quantity");
      } else {
        await addCartItem(cart.cartId, sku, 1);
        message.success("Added to cart");
        await refreshCartCount();
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      message.error("Failed to add to cart");
    }
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Title level={4}>
          Products <span>({products.length})</span>
        </Title>
      </div>

      {loading ? (
        <Spin tip="Loading products..." />
      ) : products.length === 0 ? (
        <Empty description="No products found for selected filters." />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map((p, idx) => (
              <Col span={8} key={p.productId || `product-${idx}`}>
                <Card
                  hoverable
                  style={{ position: "relative" }}
                  // onClick={() => navigate(`/productdetails/${p.productId}/${p.productSkuID}`)}
                  cover={
                    <div style={{ position: "relative" }}>
                      <img
                        alt={p.productName || "Product"}
                        src={
                          p.imageUrl?.startsWith("http")
                            ? p.imageUrl
                            : "https://placehold.co/250x250?text=No+Image"
                        }
                        style={{
                          height: 200,
                          objectFit: "contain",
                          width: "100%",
                        }}
                        onClick={() =>
                          navigate(
                            `/productdetails/${p.productId}/${p.productSkuID}`
                          )
                        }
                      />
                      <WishlistIcon
                        userId={currentUserId}
                        productSkuId={p.productSkuID}
                      />
                    </div>
                  }
                >
                  <Card.Meta
                    title={p.productName ?? "Unnamed Product"}
                    description={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 20,
                            color: "#222",
                          }}
                        >
                          ${p.productPrice ?? "—"}
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            type="primary"
                            size="middle"
                            onClick={() => handleBuyNow(p)}
                          >
                            Add to Cart
                          </Button>
                          <Modal
                            className="no-mask-background"
                            title="Select Product Options"
                            visible={isModalVisible}
                            maskStyle={{ backgroundColor: "transparent" }}
                            onCancel={() => {
                              setIsModalVisible(false);
                              setSelectedProduct(null);
                              setLoadingOptions(false); // Reset loading state
                            }}
                            footer={[
                              <Button
                                key="cancel"
                                onClick={() => setIsModalVisible(false)}
                              >
                                Cancel
                              </Button>,

                              <Button
                                key="addtocart"
                                type="primary"
                                onClick={(e) => {
                                  handleAddToCart(
                                    e,
                                    selectedProduct?.productSkuID
                                  );
                                  setIsModalVisible(false);
                                }}
                                disabled={loadingOptions}
                              >
                                Add to Cart
                              </Button>,
                            ]}
                          >
                            <div style={{ position: "relative" }}>
                              {/* Actual content */}
                              {selectedProduct && (
                                <>
                                  <ProductOptions
                                    productId={selectedProduct.productId}
                                    productSkuId={selectedProduct.productSkuID}
                                    selectedColor={selectedColor}
                                    setSelectedColor={setSelectedColor}
                                    selectedSize={selectedSize}
                                    setSelectedSize={setSelectedSize}
                                    stock={selectedProduct.stock}
                                    quantity={quantity}
                                    setQuantity={setQuantity}
                                    onOptionsLoaded={() => {
                                      console.log(
                                        "✅ Product options finished loading"
                                      );
                                      setLoadingOptions(false);
                                    }}
                                  />

                                  <Typography.Text
                                    strong
                                    style={{
                                      display: "block",
                                      marginTop: "12px",
                                    }}
                                  >
                                    Quantity:
                                  </Typography.Text>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      border: "1px solid #000",
                                      borderRadius: "4px",
                                      padding: "4px 8px",
                                      marginTop: "8px",
                                    }}
                                  >
                                    <Button
                                      icon={<MinusOutlined />}
                                      onClick={() =>
                                        setQuantity((q) =>
                                          Math.max(1, Number(q) - 1)
                                        )
                                      }
                                      disabled={quantity <= 1}
                                      size="small"
                                    />
                                    <Typography.Text>
                                      {quantity}
                                    </Typography.Text>
                                    <Button
                                      icon={<PlusOutlined />}
                                      onClick={() =>
                                        setQuantity((q) =>
                                          Math.min(
                                            Number(q) + 1,
                                            Number(selectedProduct?.stock || 99)
                                          )
                                        )
                                      }
                                      disabled={
                                        quantity >=
                                        Number(selectedProduct?.stock || 99)
                                      }
                                      size="small"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Overlay spinner */}
                              {loadingOptions && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                                    zIndex: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Spin tip="Updating product options..." />
                                </div>
                              )}
                            </div>
                          </Modal>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={pagination.pageNumber}
            pageSize={pagination.pageSize}
            total={pagination.totalCount}
            onChange={handlePageChange}
            style={{ marginTop: 24, textAlign: "center" }}
          />
        </>
      )}
    </div>
  );
}

export default ProductCatalog;
