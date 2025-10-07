// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Card,
//   Row,
//   Col,
//   Typography,
//   Button,
//   Divider,
//   message,
//   Spin,
//   Tag,
// } from "antd";
// import { DeleteOutlined } from "@ant-design/icons";
// import {
//   getCartByUserId,
//   getCartItemsByCart,
//   updateCartItem,
//   deleteCartItem,
//   getImagesBySku,
// } from "../cart.api";
// import "../../Cart/Cart.css";
// import { useCart } from "../CartContext";
// const { Title, Text } = Typography;

// // import { setBuyNow } from "../../Orders/order.slice"; //  added

// import { useDispatch } from "react-redux";
// import useGA4Tracking from "../../../../useGA4Tracking";

// const getGuestCart = () =>
//   JSON.parse(localStorage.getItem("guestCart") || "[]");
// const setGuestCart = (items) =>
//   localStorage.setItem("guestCart", JSON.stringify(items));

// const CartPage = () => {
//   const [cart, setCart] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { refreshCartCount } = useCart();
//   const userId = localStorage.getItem("userId");
//   const navigate = useNavigate();
//   const { trackBeginCheckout } = useGA4Tracking();

//   const dispatch = useDispatch();

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       if (!userId) {
//         let guestItems = getGuestCart();
//         const itemsWithImages = await Promise.all(
//           guestItems.map(async (item) => {
//             try {
//               const images = await getImagesBySku(item.productSkuId);
//               return {
//                 ...item,
//                 productImage: images[0]?.imageUrl || item.productImage,
//               };
//             } catch (err) {
//               console.error(
//                 `Image fetch failed for SKU ${item.productSkuId}:`,
//                 err
//               );
//               return item;
//             }
//           })
//         );

//         setItems(itemsWithImages);
//         setCart(null);
//         await refreshCartCount();
//         return;
//       }

//       const { data: cartData } = await getCartByUserId(userId);
//       setCart(cartData);

//       if (!cartData || !cartData.cartId) {
//         setItems([]);
//         setCart(null);
//         await refreshCartCount();

//         return;

//       }

//       const { data: itemsData } = await getCartItemsByCart(cartData.cartId);
//       const itemsWithImages = await Promise.all(
//         itemsData.map(async (item) => {
//           if (!item.productSkuId) return item;
//           try {
//             const images = await getImagesBySku(item.productSkuId);
//             return {
//               ...item,
//               productImage: images[0]?.imageUrl || item.productImage,
//             };
//           } catch (err) {
//             console.error(
//               `Image fetch failed for SKU ${item.productSkuId}:`,
//               err
//             );
//             return item;
//           }
//         })
//       );

//       setItems(itemsWithImages);
//       await refreshCartCount();
//     } catch (err) {

//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const handleUpdateQuantity = async (cartItemId, value, skuId) => {
//     try {
//       if (!userId) {
//         let guestCart = getGuestCart().map((item) =>
//           item.productSkuId === skuId ? { ...item, quantity: value } : item
//         );
//         setGuestCart(guestCart);
//         setItems(guestCart);
//         await refreshCartCount();
//         return;
//       }

//       await updateCartItem(cartItemId, value);
//       setItems((prev) =>
//         prev.map((item) =>
//           item.cartItemId === cartItemId ? { ...item, quantity: value } : item
//         )
//       );
//       await refreshCartCount();
//     } catch {
//       message.error("Failed to update quantity");
//     }
//   };

//   const handleRemoveItem = async (cartItemId, skuId) => {
//     try {
//       if (!userId) {
//         let guestCart = getGuestCart().filter(
//           (item) => item.productSkuId !== skuId
//         );
//         setGuestCart(guestCart);
//         setItems(guestCart);
//         message.error("Item removed");
//         await refreshCartCount();
//         return;
//       }

//       await deleteCartItem(cartItemId);
//       setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
//       message.error("Item removed");
//       await refreshCartCount();
//     } catch {
//       message.error("Failed to remove item");
//     }
//   };

//   const subtotal = items.reduce((acc, item) => {
//     const price = parseFloat(item.productPrice.replace("$", ""));
//     return acc + price * item.quantity;
//   }, 0);

//   const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
//   const total = subtotal;

//   const handleCheckout = () => {
//     if (!userId) {
//       message.error("Please login first!");
//       navigate("/login");
//       return;
//     }
//     const gaItems = items.map((item) => ({
//       item_id: item.productId,
//       item_name: item.productTitle || "Unnamed Product",
//       price: item.productPrice,
//       quantity: item.quantity,
//     }));

//     trackBeginCheckout({ items: gaItems, total: subtotal }); // Fire GA4 event here
//     // dispatch(setBuyNow(false));

//     navigate("/orders/summary");
//   };

//   if (loading) {
//     return (
//       <div className="cart-loading">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <Row gutter={[16, 16]} className="cart-container">
//       <Col xs={24} md={16}>
//         <Title level={2}>My Cart</Title>
//         {items.length === 0 ? (
//           <div style={{ padding: "50px", textAlign: "center", color: "#888", marginLeft: "500px" }}>
//             <Text strong style={{ fontSize: 30 }}>
//               Your cart is currently empty.
//             </Text>
//             <br />
//             <Button
//               type="link"
//               style={{ marginTop: 16 }}
//               onClick={() => navigate("/products")}
//             >
//               ← Continue Shopping
//             </Button>
//           </div>
//         ) : (
//           items.map((item) => {
//             const price = parseFloat(item.productPrice.replace("$", ""));
//             const itemTotal = price * item.quantity;

//             return (
//               <Card
//                 key={item.cartItemId || item.productSkuId}
//                 className="cart-item"
//               >
//                 <Row align="middle">
//                   <Col
//                     span={4}
//                     onClick={() =>
//                       navigate(
//                         `/productdetails/${item.productId}/${item.productSkuId}`
//                       )
//                     }
//                     className="cart-product-clickable"
//                   >
//                     <img
//                       src={item.productImage}
//                       alt={item.productTitle}
//                       className="cart-product-image"
//                     />
//                   </Col>

//                   <Col span={16} className="cart-product-details">
//                     <Title
//                       level={4}
//                       className="cart-product-title"
//                       onClick={() =>
//                         navigate(
//                           `/productdetails/${item.productId}/${item.productSkuId}`
//                         )
//                       }
//                     >
//                       {item.productTitle}{" "}
//                       {item.isOutOfStock && <Tag color="red">Out of Stock</Tag>}
//                     </Title>

//                     <Text strong>{item.productPrice}</Text>
//                     <div className="cart-product-meta">
//                       <Text type="secondary">
//                         Size: {item.productSize} | Color: {item.productColor}
//                       </Text>
//                     </div>

//                     <div className="cart-product-quantity">
//                       <div className="quantity-inline">
//                         <Text style={{ marginRight: 8 }}>Quantity:</Text>
//                         <Button
//                           size="small"
//                           onClick={() =>
//                             handleUpdateQuantity(
//                               item.cartItemId,
//                               Math.max(1, item.quantity - 1),
//                               item.productSkuId
//                             )
//                           }
//                           disabled={item.isOutOfStock || item.quantity <= 1}
//                         >
//                           -
//                         </Button>
//                         <span className="quantity-value">{item.quantity}</span>
//                         <Button
//                           size="small"
//                           onClick={() =>
//                             handleUpdateQuantity(
//                               item.cartItemId,
//                               item.quantity + 1,
//                               item.productSkuId
//                             )
//                           }
//                           disabled={item.isOutOfStock}
//                         >
//                           +
//                         </Button>
//                       </div>
//                     </div>

//                     <div className="cart-product-total">
//                       <Text strong>Total: ${itemTotal.toFixed(2)}</Text>
//                     </div>
//                   </Col>

//                   <Col span={4} className="cart-remove-btn">
//                     <Button
//                       type="text"
//                       danger
//                       icon={<DeleteOutlined />}
//                       onClick={() =>
//                         handleRemoveItem(item.cartItemId, item.productSkuId)
//                       }
//                     />
//                   </Col>
//                 </Row>
//               </Card>
//             );
//           })
//         )}
//       </Col>

//       <Col xs={24} md={8}>
//         {items.length > 0 && (
//           <Card style={{ marginTop: "50px" }}>
//             <Title level={4}>Cart Details </Title>
//             <Row justify="space-between">
//               <Text>Subtotal</Text>
//               <Text>${subtotal.toFixed(2)}</Text>
//             </Row>
//             <Row justify="space-between">
//               <Text>Total Items</Text>
//               <Text>{totalItems}</Text>
//             </Row>
//             <Divider />
//             <Button
//               type="primary"
//               block
//               size="large"
//               className="checkout-btn"
//               onClick={handleCheckout}
//             >
//               View Order Summary →
//             </Button>
//             <Button
//               block
//               size="large"
//               style={{ marginTop: "10px" }}
//               onClick={() => navigate("/products")}
//             >
//               ← Continue Shopping
//             </Button>
//           </Card>
//         )}
//       </Col>
//     </Row>
//   );

// };

// export default CartPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  message,
  Spin,
  Tag,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  getCartByUserId,
  getCartItemsByCart,
  updateCartItem,
  deleteCartItem,
  getImagesBySku,
} from "../cart.api";
import "../../Cart/Cart.css";
import { useCart } from "../CartContext";
const { Title, Text } = Typography;

// import { setBuyNow } from "../../Orders/order.slice"; //  added

import { useDispatch } from "react-redux";
import useGA4Tracking from "../../../../useGA4Tracking";

const getGuestCart = () =>
  JSON.parse(localStorage.getItem("guestCart") || "[]");
const setGuestCart = (items) =>
  localStorage.setItem("guestCart", JSON.stringify(items));

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshCartCount } = useCart();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const { trackBeginCheckout } = useGA4Tracking();

  const dispatch = useDispatch();

  const fetchCart = async () => {
    try {
      setLoading(true);
      if (!userId) {
        let guestItems = getGuestCart();
        const itemsWithImages = await Promise.all(
          guestItems.map(async (item) => {
            try {
              const images = await getImagesBySku(item.productSkuId);
              return {
                ...item,
                productImage: images[0]?.imageUrl || item.productImage,
              };
            } catch (err) {
              console.error(
                `Image fetch failed for SKU ${item.productSkuId}:`,
                err
              );
              return item;
            }
          })
        );

        setItems(itemsWithImages);
        setCart(null);
        await refreshCartCount();
        return;
      }

      const { data: cartData } = await getCartByUserId(userId);
      setCart(cartData);

      if (!cartData || !cartData.cartId) {
        setItems([]);
        setCart(null);
        await refreshCartCount();

        return;
      }

      const { data: itemsData } = await getCartItemsByCart(cartData.cartId);
      const itemsWithImages = await Promise.all(
        itemsData.map(async (item) => {
          if (!item.productSkuId) return item;
          try {
            const images = await getImagesBySku(item.productSkuId);
            return {
              ...item,
              productImage: images[0]?.imageUrl || item.productImage,
            };
          } catch (err) {
            console.error(
              `Image fetch failed for SKU ${item.productSkuId}:`,
              err
            );
            return item;
          }
        })
      );

      setItems(itemsWithImages);
      await refreshCartCount();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (cartItemId, value, skuId) => {
    try {
      if (!userId) {
        let guestCart = getGuestCart().map((item) =>
          item.productSkuId === skuId ? { ...item, quantity: value } : item
        );
        setGuestCart(guestCart);
        setItems(guestCart);
        await refreshCartCount();
        return;
      }

      await updateCartItem(cartItemId, value);
      setItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: value } : item
        )
      );
      await refreshCartCount();
    } catch {
      message.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId, skuId) => {
    try {
      if (!userId) {
        let guestCart = getGuestCart().filter(
          (item) => item.productSkuId !== skuId
        );
        setGuestCart(guestCart);
        setItems(guestCart);
        message.error("Item removed");
        await refreshCartCount();
        return;
      }

      await deleteCartItem(cartItemId);
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
      message.error("Item removed");
      await refreshCartCount();
    } catch {
      message.error("Failed to remove item");
    }
  };

  const subtotal = items.reduce((acc, item) => {
    const price = parseFloat(item.productPrice.replace("$", ""));
    return acc + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = subtotal;

  const handleCheckout = () => {
    if (!userId) {
      message.error("Please login first!");
      navigate("/login");
      return;
    }
    const gaItems = items.map((item) => ({
      item_id: item.productId,
      item_name: item.productTitle || "Unnamed Product",
      price: item.productPrice,
      quantity: item.quantity,
    }));

    trackBeginCheckout({ items: gaItems, total: subtotal });
    // dispatch(setBuyNow(false));

    navigate("/orders/summary");
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]} className="cart-container">
      <Col xs={24} md={16}>
        <Title level={2}>My Cart</Title>
        {items.length === 0 ? (
          <div style={{ padding: "50px", textAlign: "center", color: "#888" }}>
            <Text strong style={{ fontSize: 30 }}>
              Your cart is currently empty.
            </Text>
            <br />
            <Button
              type="link"
              className="empty-cart-btn"
              onClick={() => navigate("/products")}
            >
              ← Continue Shopping
            </Button>
          </div>
        ) : (
          items.map((item) => {
            const price = parseFloat(item.productPrice.replace("$", ""));
            const itemTotal = price * item.quantity;

            return (
              <Card
                key={item.cartItemId || item.productSkuId}
                className="cart-item"
              >
                <Row align="middle">
                  <Col
                    span={4}
                    onClick={() =>
                      navigate(
                        `/productdetails/${item.productId}/${item.productSkuId}`
                      )
                    }
                    className="cart-product-clickable"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="cart-product-image"
                    />
                  </Col>

                  <Col span={16} className="cart-product-details">
                    <Title
                      level={4}
                      className="cart-product-title"
                      onClick={() =>
                        navigate(
                          `/productdetails/${item.productId}/${item.productSkuId}`
                        )
                      }
                    >
                      {item.productTitle}{" "}
                      {item.isOutOfStock && <Tag color="red">Out of Stock</Tag>}
                    </Title>

                    <Text strong>{item.productPrice}</Text>
                    <div className="cart-product-meta">
                      <Text type="secondary">
                        Size: {item.productSize} | Color: {item.productColor}
                      </Text>
                    </div>

                    <div className="cart-product-quantity">
                      <div className="quantity-inline">
                        <Text style={{ marginRight: 8 }}>Quantity:</Text>
                        <Button
                          size="small"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              Math.max(1, item.quantity - 1),
                              item.productSkuId
                            )
                          }
                          disabled={item.isOutOfStock || item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="quantity-value">{item.quantity}</span>
                        <Button
                          size="small"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              item.quantity + 1,
                              item.productSkuId
                            )
                          }
                          disabled={item.isOutOfStock}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="cart-product-total">
                      <Text strong>Total: ${itemTotal.toFixed(2)}</Text>
                    </div>
                  </Col>

                  <Col span={4} className="cart-remove-btn">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleRemoveItem(item.cartItemId, item.productSkuId)
                      }
                    />
                  </Col>
                </Row>
              </Card>
            );
          })
        )}
      </Col>
      <Col xs={24} md={8}>
        <Card style={{ marginTop: "50px" }}>
          <Title level={4}>Cart Details</Title>
          <Row justify="space-between">
            <Text>Subtotal</Text>
            <Text>${subtotal?.toFixed(2) || "0.00"}</Text>
          </Row>
          <Row justify="space-between">
            <Text>Total Items</Text>
            <Text>{totalItems || 0}</Text>
          </Row>
          <Divider />
          <Button
            type="primary"
            block
            size="large"
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={items.length === 0} // Disable if empty
          >
            {items.length === 0 ? "Cart is Empty" : "View Order Summary →"}
          </Button>
          <Button
            block
            size="large"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </Button>
        </Card>
      </Col>
    </Row>
  );
};

export default CartPage;
