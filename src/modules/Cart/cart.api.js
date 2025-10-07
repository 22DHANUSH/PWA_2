import cart_api from "../../app/cart.axios";
import user_api from "../../app/users.axios";

export const createCart = (userId) => cart_api.post(`/carts`, { userId });

export const getCartById = (cartId) => cart_api.get(`/carts/${cartId}`);

export const getCartByUserId = (userId) => cart_api.get(`/carts/user/${userId}`);

export const updateCart = (cartId, userId, updatedAt) => cart_api.put(`/carts/${cartId}?userId=${userId}`, { updatedAt });

export const deleteCart = (cartId) => cart_api.delete(`/carts/${cartId}`);

export const addCartItem = (cartId, productSkuId, quantity) => cart_api.post(`/cart_items`, { cartId, productSkuId, quantity });

export const getCartItems = () => cart_api.get(`/cart_items`);

export const getCartItemById = (cartItemId) => cart_api.get(`/cart_items/${cartItemId}`);

export const updateCartItem = (cartItemId, quantity) => cart_api.put(`/cart_items/${cartItemId}`, { quantity });

export const deleteCartItem = (cartItemId) => cart_api.delete(`/cart_items/${cartItemId}`);

export const getCartItemsByCart = (cartId) => cart_api.get(`/cart_items/display/by-cart/${cartId}`);

export const getCartItemBySku = (cartId, skuId) => cart_api.get(`/cart_items/${cartId}/sku/${skuId}`);

export const clearCartByUser = (userId) =>
  cart_api.delete(`/cart_items/clear/user/${userId}`);


export async function getImagesBySku(skuId) {
  try {
    const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
    return Array.isArray(response.data) ? response.data.slice(0, 9) : [];
  } catch (error) {
    console.error(`Failed to fetch images for SKU ${skuId}:`, error.message);
    return [];
  }
}

export const addToCartFlow = async (userId, productSkuId, quantity) => {
  let cartRes = await getCartByUserId(userId);
  let cartId;

  if (!cartRes.data) {
    const newCart = await createCart(userId);
    cartId = newCart.data.cartId;
  } else {
    cartId = cartRes.data.cartId;
  }

  try {
    const existingItem = await getCartItemBySku(cartId, productSkuId);
    if (existingItem?.data) {
      const newQty = existingItem.data.quantity + quantity;
      await updateCartItem(existingItem.data.cartItemId, newQty);
      return { ...existingItem.data, quantity: newQty };
    }
  } catch (err) {
    if (err.response?.status !== 404) {
      console.error("Unexpected error while checking existing cart item:", err);
      throw err; 
    }
  }

  const newItem = await addCartItem(cartId, productSkuId, quantity);
  return newItem.data;
};

const getGuestCart = () => JSON.parse(localStorage.getItem("guestCart") || "[]");
const clearGuestCart = () => localStorage.removeItem("guestCart");

export async function mergeGuestCart(userId) {
  const guestItems = getGuestCart();
  if (!guestItems || guestItems.length === 0) return;

  let cartId;

  try {
    const cartRes = await getCartByUserId(userId);
    cartId = cartRes?.data?.cartId;
  } catch (err) {
    if (err?.response?.status === 404) {
      try {
        const created = await createCart(userId);
        cartId = created?.data?.cartId;
      } catch (createErr) {
        console.error("Failed to create cart for user:", userId, createErr);
        throw createErr;
      }
    } else {
      console.error("Failed to fetch cart for user:", userId, err);
      throw err;
    }
  }

  if (!cartId) {
    const created = await createCart(userId);
    cartId = created?.data?.cartId;
  }

  if (!cartId) {
    throw new Error("Could not obtain cartId for user " + userId);
  }

  for (const item of guestItems) {
    try {
      const existingRes = await getCartItemBySku(cartId, item.productSkuId);
      const existing = existingRes?.data;

      if (existing) {
        const newQty = (existing.quantity || 0) + (item.quantity || 0);
        await updateCartItem(existing.cartItemId, newQty);
      } else {
        await addCartItem(cartId, item.productSkuId, item.quantity);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await addCartItem(cartId, item.productSkuId, item.quantity);
        } catch (addErr) {
          console.error("Failed to add guest item to cart:", item, addErr);
        }
      } else {
        console.error("Error while merging item:", item, err);
      }
    }
  }

  clearGuestCart();
  console.log("Guest cart merged into user cart (cartId:", cartId, ")");
}