import order_api from "../../app/order.axios";
import user_api from "../../app/users.axios";
 
 
// Fetch orders for user with pagination
export const getOrdersByUser = async (userId, pageNumber, pageSize) => {
  const response = await order_api.get(`/orders/orderByUser/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data;
};
 
// Fetch order items for a specific order
export const getOrderItems = async (orderId) => {
  const response = await order_api.get(`/order_items/byOrder/${orderId}`);
  return response.data;
};
 
// Fetch tracking details
export const getOrderTracking = async (userId, orderId) => {
  const response = await order_api.get(`/order-tracking/${userId}/${orderId}`);
  return response.data;
};
 
// Get order details (shipping + product info)
export const getOrderTrackingDetails = async (userId, orderId) => {
  const res = await order_api.get(`/order-tracking/${userId}/${orderId}`);
  return res.data;
};
 
// Get order status timeline
export const getOrderStatusTimeline = async (orderId) => {
  const res = await order_api.get(`/order_status_history/status/${orderId}`);
  return res.data;
};
 
// Get Product images using productSkuId
export async function getPrimaryImageBySku(skuId) {
  if (!skuId) {
    console.warn("SKU ID is missing");
    return null;
  }
 
  try {
    const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
    const images = Array.isArray(response.data) ? response.data : [];
    const primaryImage = images.find(img => img.isPrimary === true);
    return primaryImage?.imageUrl || null;
  } catch (error) {
    console.error(`Error fetching image for SKU ${skuId}`, error.message);
    return null;
  }
}

// Update an order (status, totalAmount, userId, addressId)
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await order_api.put(`/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};