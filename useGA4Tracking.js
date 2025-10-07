// useGA4Tracking.js
import { useEffect } from "react";

// Helper to safely parse price strings like "$123.45" or numeric values
const parsePrice = (price) => {
  if (!price) return 0;
  if (typeof price === "number") return price;
  return parseFloat(price.toString().replace(/[^0-9.-]+/g, "")) || 0;
};

const useGA4Tracking = () => {
  // Safe wrapper for gtag
  const sendEvent = (eventName, params = {}) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params);
    } else {
      console.warn("GA4 not initialized or gtag missing");
    }
  };

  // Standard ecommerce events
  const trackViewItem = (product) => {
    const price = parsePrice(product.productPrice || product.price);
    const name =
      product.productTitle || product.productName || "Unnamed Product";
    const id = product.productId || 0;

    sendEvent("view_item", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name: name,
          item_id: id,
          price,
        },
      ],
    });
  };

  const trackAddToCart = (product) => {
    const price = parsePrice(product.productPrice || product.price);
    sendEvent("add_to_cart", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name:
            product.productTitle || product.productName || "Unnamed Product",

          item_id: product.productId || 0,
          price,
          quantity: product.quantity || 1,
        },
      ],
    });
  };

  const trackBeginCheckout = ({ items, total }) => {
    if (!items || items.length === 0) return;

    const gaItems = items.map((item) => ({

      item_id: item.item_id || 0,
      item_name: item.item_name || item.productName || "Unnamed Product",
      price: parsePrice(item.productPrice || item.price),
      quantity: item.quantity || 1,
    }));

    sendEvent("begin_checkout", {
      currency: "USD",
      value: parsePrice(total),
      items: gaItems,
    });
  };

  const trackPurchase = ({ items, value, transaction_id }) => {
    if (!items || items.length === 0) return;

    const gaItems = items.map((item) => ({
      item_id: item.item_id || 0,
      item_name: item.item_name || "Unnamed Product",
      price: Number(parsePrice(item.price)) || 0,
      quantity: Number(item.quantity) || 1,
    }));

    const fallbackValue = gaItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const totalValue = parsePrice(value);

    sendEvent("purchase", {
      transaction_id: transaction_id || `txn_${Date.now()}`,
      currency: "USD",
      value: totalValue || fallbackValue,
      items: gaItems,
    });
  };

  // Custom Wishlist Tracking
  const trackAddToWishlist = (product) => {
    const price = parsePrice(product.productPrice || product.price);

    sendEvent("add_to_wishlist", {
      currency: "USD",
      value: price,
      items: [
        {
          item_name:
            product.productTitle || product.productName || "Unnamed Product",

          item_id: product.productId || 0,
          price,
        },
      ],
    });
  };

  return {
    trackViewItem,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackAddToWishlist, // expose wishlist tracking
  };
};

export default useGA4Tracking;
