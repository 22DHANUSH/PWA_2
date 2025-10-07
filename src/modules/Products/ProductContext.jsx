import React, { createContext, useContext, useEffect, useState } from "react";
import product_api from "../../app/product.axios";
import user_api from "../../app/users.axios";
import { mapToRequestPayload } from "./MapToRequestPayload";
import { useSelector } from "react-redux";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.auth.userId);

  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("productFilters");
    return saved
      ? JSON.parse(saved)
      : {
          brandIds: [],
          categoryIds: [],
          colors: [],
          sizes: [],
          genders: [],
          minPrice: 0,
          maxPrice: 500,
          searchTerm: "",
          userId: userId,
        };
  });

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalCount: 0,
  });

  useEffect(() => {
    sessionStorage.setItem("productFilters", JSON.stringify(filters));
  }, [filters]);

  const getPrimaryImageWithSas = async (skuId) => {
    try {
      const response = await user_api.get(`/blob/GenerateSasToken/${skuId}/1`);
      const images = Array.isArray(response.data) ? response.data : [];
      const primaryImage = images.find((img) => img.isPrimary === true);
      if (primaryImage?.imagePath && primaryImage?.sasToken) {
        return `${primaryImage.imagePath}?${primaryImage.sasToken}`;
      }
      return primaryImage?.imageUrl ?? "";
    } catch (err) {
      console.error(`Error fetching SAS image for SKU ${skuId}`, err.message);
      return "";
    }
  };

  const fetchProducts = async (
    model = filters,
    pageNumber = pagination.pageNumber,
    pageSize = pagination.pageSize
  ) => {
    setLoading(true);
    try {
      const payload = mapToRequestPayload(model);
      if (userId) payload.userId = userId;

      const res = await product_api.post(
        `/products/search?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        payload
      );

      const rawProducts = res.data?.products ?? res.data ?? [];

      const enrichedProducts = await Promise.all(
        rawProducts.map(async (product) => {
          const imageUrl = await getPrimaryImageWithSas(product.productSkuID);
          return { ...product, imageUrl };
        })
      );

      setProducts(enrichedProducts);
      setPagination((prev) => ({
        ...prev,
        pageNumber,
        pageSize,
        total: res.data.totalCount || 180,
      }));
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filters, pagination.pageNumber, pagination.pageSize);
  }, [filters, pagination.pageNumber]);

  return (
    <ProductContext.Provider
      value={{
        products,
        filters,
        setFilters,
        fetchProducts,
        loading,
        pagination,
        setPagination,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
