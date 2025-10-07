import { createContext, useContext, useState, useEffect } from "react";
import { getCartByUserId, getCartItemsByCart } from "./cart.api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  const getGuestCart = () =>
    JSON.parse(localStorage.getItem("guestCart") || "[]");

  const refreshCartCount = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      const guestItems = getGuestCart();
      const count = guestItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
      setCartCount(count);
      return;
    }

    try {
      const { data: cartData } = await getCartByUserId(userId);
      if (!cartData?.cartId) {
        setCartCount(0);
        return;
      }

      const { data: itemsData } = await getCartItemsByCart(cartData.cartId);
      const count = itemsData.reduce(
        (acc, item) => acc + (item.quantity || 0),
        0
      );
      setCartCount(count);
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}