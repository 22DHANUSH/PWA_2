import { useState, useEffect } from "react";
import { Button, Typography, message } from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import WishlistButton from "../../../Users/WishlistItems/Components/WishlistButton";
import { addToCartFlow } from "../../../Cart/cart.api";
import { useCart } from "../../../Cart/CartContext";
import useGA4Tracking from "../../../../../useGA4Tracking.js";
 
const { Text } = Typography;
 
const ProductActions = ({ stock, price, userId, productSkuId, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { refreshCartCount } = useCart();
  const { trackAddToCart } = useGA4Tracking();
 
  useEffect(() => {
    setQuantity(1);
  }, [stock]);
 
  const handleIncrease = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    }
  };
 
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };
 
  const getGuestCart = () =>
    JSON.parse(localStorage.getItem("guestCart") || "[]");
  const setGuestCart = (items) =>
    localStorage.setItem("guestCart", JSON.stringify(items));
  const handleAddToCart = async () => {
   
  if (stock <= 0) {
    message.error("This product is currently out of stock.");
    return;
  }
 
    try {
      setLoading(true);
 
      if (!userId) {
        let guestCart = getGuestCart();
        const existing = guestCart.find(
          (item) => item.productSkuId === productSkuId
        );
 
        if (existing) {
          existing.quantity += quantity;
        } else {
          guestCart.push({
            productSkuId,
            quantity,
            productId: product.productId,
            productTitle: product.productTitle,
            productPrice: price,
            productImage: product.imageUrl || "",
            productSize: product.productSize || "",
            productColor: product.productColor || "",
          });
        }
 
        setGuestCart(guestCart);
        message.success("Added to cart!");
        await refreshCartCount();
        return;
      }
 
      await addToCartFlow(userId, productSkuId, quantity, {
        productId: product.productId,
        productTitle: product.productTitle,
        productPrice: price,
        productSize: product.productSize,
        productColor: product.productColor,
      });
      message.success("Added to cart!");
      await refreshCartCount();
    } catch (error) {
      console.error("Add to cart failed:", error);
      message.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div
      style={{
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Text strong>Quantity:</Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid #000",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          >
            <Button
              icon={<MinusOutlined />}
              onClick={handleDecrease}
              disabled={quantity <= 1}
              size="small"
            />
            <Text>{quantity}</Text>
            <Button
              icon={<PlusOutlined />}
              onClick={handleIncrease}
              disabled={quantity >= stock}
              size="small"
            />
          </div>
        </div>
      </div>
 
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
        }}
      >
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          loading={loading}
          style={{ backgroundColor: "#000", borderColor: "#000" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#333")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#000")}
          onClick={() => {
            handleAddToCart();
 
            trackAddToCart({
              productTitle: product.productTitle || product.productName,
              productPrice: product.productPrice || 0,
              productId: product.productId,
            });
          }}
        >
          Add to Cart
        </Button>
 
        <div style={{ flex: 1, minWidth: "120px", maxWidth: "180px" }}>
          <WishlistButton userId={userId} productSkuId={productSkuId} />
        </div>
      </div>
    </div>
  );
};
 
export default ProductActions;
 
 