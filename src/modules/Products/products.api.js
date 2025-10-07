import product_api from "../../app/product.axios";
import user_api from "../../app/users.axios";

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

async function enrichWithImage(products) {
  return await Promise.all(
    products.map(async (product) => {
      if (!product.productSkuID) {
        console.warn("Missing SKU ID in product:", product);
        return { ...product, imageUrl: product.imageUrl || "" };
      }

      const imageUrl = await getPrimaryImageBySku(product.productSkuID);
      return {
        ...product,
        imageUrl: imageUrl || product.imageUrl || "",
      };
    })
  );
}

function mapProduct(product) {
  return {
    name: product.productName,
    productId: product.productId,
    price: product.productPrice,
    category: product.categoryName,
    productSkuID: product.productSkuID,
    imageUrl: product.imageUrl,
    meta: `${product.productColor} • ${product.productSize}`,
  };
}

export async function getCollections(categoryIds) {
  try {
    const response = await product_api.post("/products/search", { categoryIds });
    const products = response.data || [];
    const mapped = products.map(mapProduct);
    return await enrichWithImage(mapped);
  } catch (error) {
    console.error("Error fetching collections:", error.message);
    return [];
  }
}


export async function getHeroImages() {
  try {
    const { data } = await product_api.get("/products/date/desc?pageNumber=1&pageSize=2");

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Unexpected or empty hero image response:", data);
      return [];
    }

    const selectedItems = [data[0], data[data.length - 1]].filter(Boolean);

    const enriched = await Promise.all(
      selectedItems.map(async (item) => {
        const productId = item.productId
        const skuId = item.productSkuId;
        if (!skuId) {
          console.warn("Missing SKU ID in hero image item:", item);
          return { ...item, imageUrl: item.imageUrl || "" };
        }

        try {
          const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
          const images = Array.isArray(response.data) ? response.data : [];
          const primaryImage = images.find((img) => img.isPrimary === true);

          return {
            ...item,
            imageUrl: primaryImage?.imageUrl,
          };
        } catch (err) {
          console.error(`Failed to fetch SAS image for SKU ${skuId}`, err.message);
          return {
            ...item,
            imageUrl: item.imageUrl || "",
          };
        }
      })
    );

    return enriched.filter(Boolean);
  } catch (error) {
    console.error("Error fetching hero images:", error.message);
    return [];
  }
}
export async function getMensCollection() {
  try {
    const response = await product_api.post("/products/search", {
      categoryIds: [1],
    });
    const products = response.data || [];

    const mapped = products.map(product => ({
      productName: product.productName,
      productId: product.productId,
      productSkuID: product.productSkuID,
      imageUrl: product.imageUrl,
      price: product.productPrice,
    }));

    return await enrichWithImage(mapped);
  } catch (error) {
    console.error("Error fetching men's collection:", error.message);
    return [];
  }
}

export async function getNewThisWeek() {
  try {
    const { data } = await product_api.get("/new_products");
    const mapped = (data || []).map(item => ({
      id: item.id,
      productName: item.productName,
      productSkuID: item.productSkuID,
      imageUrl: item.imageUrl,
      price: item.productPrice,
    }));
    return await enrichWithImage(mapped);
  } catch (err) {
    console.error("Error fetching new products:", err.message);
    return [];
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getProductList({
  page = 1,
  pageSize = 9,
  query = '',
  category = 'NEW',
  sizes = [],
  availFilter = 'any',
  price = [59, 299],
  minRating = 0,
  tags = [],
} = {}) {
  await delay(120);


  const all = buildCatalog().map(p => ({
    ...p,
    productSkuID: p.productSkuID ?? p.skuId ?? '',
  }));

  const stats = {
    available: all.filter(p => p.inStock).length,
    outOfStock: all.filter(p => !p.inStock).length,
  };

  let filtered = [...all];


  if (category !== 'NEW') {
    filtered = filtered.filter(p => p.category === category);
  } else {
    filtered = filtered.filter(p => p.isNew);
  }


  if (query) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q)
    );
  }


  if (sizes.length) {
    filtered = filtered.filter(p => sizes.some(s => p.sizes.includes(s)));
  }


  if (availFilter === 'in') filtered = filtered.filter(p => p.inStock);
  if (availFilter === 'out') filtered = filtered.filter(p => !p.inStock);


  filtered = filtered.filter(p => p.price >= price[0] && p.price <= price[1]);


  if (minRating > 0) {
    filtered = filtered.filter(p => p.rating >= minRating);
  }


  if (tags.length) {
    filtered = filtered.filter(p => tags.every(t => p.tags.includes(t)));
  }


  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);


  const enrichedItems = await enrichWithImage(pageItems);

  return { items: enrichedItems, total, stats };
}

export async function getColorsByProductId(productId) {
  const response = await product_api.get(`/product_skus/ColorsById/${productId}`);
  return response.data;
}

export async function getSizesByProductId(productId) {
  const response = await product_api.get(`/product_skus/SizesById/${productId}`);
  return response.data;
}

export async function getReviewsByProductId(productId) {
  try {
    const response = await product_api.get(`/product_reviews/ById${productId}`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn("No reviews found for product:", productId);
      return [];
    }
    throw err;
  }
}

export async function getProductById(productId) {
  const response = await product_api.get(`/products/${productId}`);
  return response.data;
}

export async function getSkusByProductId(productId) {
  const response = await product_api.get(`/product_skus/ById/${productId}`);
  return response.data;
}


export async function getImagesBySku(skuId) {
  try {
    const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
    return Array.isArray(response.data) ? response.data.slice(0, 9) : [];
  } catch (error) {
    console.error(`Failed to fetch images for SKU ${skuId}:`, error.message);
    return [];
  }
}



export async function editReview({ reviewId, reviewText, rating, productSkuId, userId }) {
  await product_api.put(`/product_reviews/${reviewId}`, {
    reviewId,
    reviewText,
    rating,
    productSkuId,
    userId
  });
}

export async function deleteReview(reviewId) {
  await product_api.delete(`/product_reviews/${reviewId}`);
}


export async function addReview({ reviewText, rating, productSkuId, userId }) {
  const newReview = { reviewText, rating, productSkuId, userId };
  const response = await product_api.post("/product_reviews", newReview);
  return response.data;
}


export async function getUserNameById(userId) {
  try {
    const res = await user_api.get(`/users/${userId}`);
    const user = res.data;
    return `${user.firstName} ${user.lastName}`;
  } catch (err) {
    console.error("Error fetching user:", err);
    return "Unknown User";
  }
}


export const getProductSkuById = async (skuId) => {
  const res = await product_api.get(`/product_skus/${skuId}`);
  return res.data;
};


export async function getBrands() {
  const response = await product_api.get(`/brands`);
  return response.data;
}


export async function getCategories(pageNumber = 1, pageSize = 20) {
  const response = await product_api.get(`/categories?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data;
}


export async function getFilteredProducts(filters) {
  const response = await product_api.post(`/products/filter`, filters);
  return response.data;
}

export async function searchProducts(payload) {
  const response = await product_api.post(`/products/search`, payload);
  return response.data;
}

