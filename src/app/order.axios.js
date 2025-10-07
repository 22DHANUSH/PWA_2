import axios from "axios";
const ORDER_URL = import.meta.env.VITE_API_ORDER_URL;
const order_api = axios.create({
  baseURL: ORDER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export default order_api;

// // Add Buy Now API
// export const createBuyNowOrder = (userId, productSkuId, quantity) =>
//   Orders_api.post(`/orders/buy-now`, { userId, productSkuId, quantity });

// export default Orders_api;
