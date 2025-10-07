// ProductsPage.jsx
import React, { useEffect, useState } from "react";
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
  addWishlistItem,
  deleteWishlistItemByUserIdAndProductSkuId,
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

import ProductOptions from "../../Product_Description/Components/ProductOptions";
import useGA4Tracking from "../../../../../useGA4Tracking.js";
import {
  getCachedSkus,
  setCachedSkus,
} from "../../Product_Catalog/Components/ProductSkuCache.jsx";
import { getSkusByProductId, getImagesBySku } from "../../products.api.js";

const { Title } = Typography;

// ---------- Guest cart helpers ----------
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
// ----------------------------------------

function ProductsPage() {
  const { products, loading, pagination, setPagination } = useProducts();
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const userId = localStorage.getItem("userId");
  const [wishlistMap, setWishlistMap] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [selectedSku, setSelectedSku] = useState(null);
  const { trackAddToCart, trackAddToWishlist } = useGA4Tracking();
  const [localProducts, setLocalProducts] = useState([]);
  const [skus, setSkus] = useState([]);

  useEffect(() => {
    const fetchSkus = async () => {
      setLoadingOptions(true);

      const cached = getCachedSkus(selectedProduct?.productId);
      if (cached) {
        setSkus([...cached]);
        setLoadingOptions(false); // ✅ Hide spinner
        return;
      }

      try {
        const data = await getSkusByProductId(selectedProduct?.productId);
        console.log("Fetched SKUs:", data);
        setCachedSkus(selectedProduct?.productId, data);
        setSkus([...data]);
      } catch (err) {
        console.error("Error fetching SKUs:", err);
      } finally {
        setLoadingOptions(false); // ✅ Hide spinner after fetch
      }
    };

    if (selectedProduct?.productId) {
      fetchSkus();
    }
  }, [selectedProduct]);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleOptionsLoaded = () => {
    setLoadingOptions(false);
  };

  const handleBuyNow = (product) => {
    setLoadingOptions(true);
    setSelectedColor(null);
    setSelectedSize(null);
    setQuantity(1);
    setSelectedSku(null);
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchWishlistStates();
  }, [localProducts]);

  const fetchWishlistStates = async () => {
    if (!userId || localProducts.length === 0) return;

    const map = {};
    for (const p of localProducts) {
      map[p.productSkuID] = p.isWishlisted == 1 ? p.isWishlisted : 0;
    }
    setWishlistMap(map);
  };

  const updateProductWishlistFlag = (skuId, flag) => {
    setLocalProducts((prev) =>
      prev.map((product) =>
        product.productSkuID === skuId
          ? { ...product, isWishlisted: flag }
          : product
      )
    );
  };

  const handleToggleWishlist = async (e, productSkuId) => {
    e.stopPropagation();
    if (!userId) {
      message.warning("Please log in to use wishlist");
      return;
    }

    const wishlistItemId = wishlistMap[productSkuId];

    try {
      if (wishlistItemId) {
        const res = await deleteWishlistItemByUserIdAndProductSkuId(
          userId,
          productSkuId
        );
        if (res?.deleted) {
          message.error("Removed from wishlist");
          setWishlistMap((prev) => ({ ...prev, [productSkuId]: 0 }));
          updateProductWishlistFlag(productSkuId, 0);
        } else {
          message.error("Failed to remove from wishlist");
        }
      } else {
        const addedAt = new Date().toISOString();
        const res = await addWishlistItem(userId, productSkuId, addedAt);
        if (res === -1) {
          message.info("Already in wishlist");
        } else if (res > 0) {
          message.success("Added to wishlist");
          setWishlistMap((prev) => ({ ...prev, [productSkuId]: 1 }));
          updateProductWishlistFlag(productSkuId, 1);
        } else {
          message.error("Failed to add to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (
    e,
    productSkuId,
    quantity = 1,
    product = null
  ) => {
    e.stopPropagation();

    if (!productSkuId) {
      message.error("Product SKU is missing");
      return;
    }

    if (!userId) {
      if (!product) {
        message.error("Product details missing for guest cart");
        return;
      }

      addToGuestCart(product, quantity);
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
        const res = await getCartItemBySku(cart.cartId, productSkuId);
        existingItem = res.data;
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("Item not found in cart, will add new.");
        } else {
          throw err;
        }
      }

      if (existingItem) {
        await updateCartItem(
          existingItem.cartItemId,
          existingItem.quantity + quantity
        );
        message.success("Updated cart quantity");
      } else {
        await addCartItem(cart.cartId, productSkuId, quantity);
        message.success("Added to cart");
      }

      await refreshCartCount();
    } catch (err) {
      console.error("Error adding to cart:", err);
      message.error("Failed to add to cart");
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageNumber: page }));
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Title level={4}>
          Products <span>({localProducts.length})</span>
        </Title>
      </div>

      {loading ? (
        <Spin tip="Loading products..." />
      ) : products.length === 0 ? (
        <Empty description="No products found for selected filters." />
      ) : (
        <>
          <Row gutter={[16, 16]} justify="center">
            {localProducts.map((p, idx) => {
              const wishlisted = wishlistMap[p.productSkuID] === 1;
              return (
                <Col
                  key={p.productId || `product-${idx}`}
                  xs={24} // 1 col on phones
                  sm={12} // 2 cols on tablets
                  md={8} // 3 cols on desktop
                >
                  <Card
                    hoverable
                    style={{ position: "relative", height: "100%" }}
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
                        {wishlisted ? (
                          <HeartFilled
                            onClick={(e) =>
                              handleToggleWishlist(e, p.productSkuID)
                            }
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              fontSize: 20,
                              color: "black",
                              cursor: "pointer",
                            }}
                          />
                        ) : (
                          <HeartOutlined
                            onClick={(e) => {
                              handleToggleWishlist(e, p.productSkuID);
                              trackAddToWishlist({
                                productTitle: p.productName || p.productTitle,
                                productPrice: Number(p.productPrice) || 0,
                                productId: p.productId,
                              });
                            }}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              fontSize: 20,
                              color: "#090909ff",
                              cursor: "pointer",
                            }}
                          />
                        )}
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
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              justifyContent: "center",
                            }}
                          >
                            <Button
                              type="primary"
                              size="middle"
                              onClick={() => {
                                handleBuyNow(p);
                                trackAddToCart({
                                  productSkuId: p.productSkuID,
                                  productTitle: p.productName || p.productTitle,
                                  productPrice: Number(p.productPrice) || 0,
                                  productId: p.productId,
                                });
                              }}
                            >
                              Add to Cart
                            </Button>
                            <Modal
                              className="no-mask-background"
                              open={isModalVisible && !!selectedProduct}
                              title={
                                <div
                                  style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    textAlign: "center",
                                  }}
                                >
                                  {selectedProduct?.name ||
                                    selectedProduct?.productName ||
                                    "Product"}
                                </div>
                              }
                              maskStyle={{ backgroundColor: "transparent" }}
                              width={600}
                              bodyStyle={{
                                minHeight: 400,
                                maxHeight: 500,
                                overflowY: "auto",
                                padding: "16px",
                              }}
                              onCancel={() => {
                                setIsModalVisible(false);
                                setSelectedProduct(null);
                                setSelectedColor(null);
                                setSelectedSize(null);
                                setQuantity(1);
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
                                    const matchedSku = skus.find(
                                      (sku) =>
                                        sku.productColor === selectedColor &&
                                        sku.productSize === selectedSize
                                    );

                                    if (!matchedSku?.productSkuId) {
                                      message.error(
                                        "Please select valid color and size"
                                      );
                                      return;
                                    }

                                    handleAddToCart(
                                      e,
                                      matchedSku.productSkuId,
                                      quantity,
                                      {
                                        ...selectedProduct,
                                        ...matchedSku,
                                        productSize: selectedSize,
                                        productColor: selectedColor,
                                      }
                                    );
                                    setIsModalVisible(false);
                                  }}
                                  disabled={
                                    !selectedColor ||
                                    !selectedSize ||
                                    loadingOptions
                                  }
                                >
                                  Add to Cart
                                </Button>,
                              ]}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  height: "100%",
                                }}
                              >
                                {loadingOptions && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      background: "rgba(255,255,255,0.8)",
                                      zIndex: 10,
                                    }}
                                  >
                                    <Spin tip="Loading product options..." />
                                  </div>
                                )}

                                {selectedProduct && (
                                  <>
                                    <ProductOptions
                                      productSkuId={
                                        selectedProduct.productSkuId
                                      }
                                      selectedColor={selectedColor}
                                      setSelectedColor={setSelectedColor}
                                      selectedSize={selectedSize}
                                      setSelectedSize={setSelectedSize}
                                      quantity={quantity}
                                      setQuantity={setQuantity}
                                      onOptionsLoaded={() =>
                                        setLoadingOptions(false)
                                      }
                                      skus={skus}
                                    />

                                    <div
                                      style={{
                                        marginTop: 20,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 12,
                                      }}
                                    >
                                      <Button
                                        onClick={() =>
                                          setQuantity((q) => Math.max(1, q - 1))
                                        }
                                        disabled={quantity <= 1}
                                      >
                                        -
                                      </Button>
                                      <span
                                        style={{
                                          fontSize: 18,
                                          fontWeight: "bold",
                                          minWidth: 30,
                                          textAlign: "center",
                                        }}
                                      >
                                        {quantity}
                                      </span>
                                      <Button
                                        onClick={() =>
                                          setQuantity((q) => q + 1)
                                        }
                                        disabled={
                                          selectedProduct?.stock &&
                                          quantity >= selectedProduct.stock
                                        }
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </Modal>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              current={pagination.pageNumber}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ProductsPage;
