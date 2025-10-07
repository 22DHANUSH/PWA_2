// utils/ProductSkuCache.js
const skuCache = {};
 
export const getCachedSkus = (productId) => skuCache[productId];
export const setCachedSkus = (productId, skus) => {
  skuCache[productId] = skus;
}
 
