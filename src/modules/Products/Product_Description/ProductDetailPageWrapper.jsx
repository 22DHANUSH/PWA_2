import React from "react";
import { useParams } from "react-router-dom";
import ProductDetailPage from './Pages/ProductDetailsPage';

const ProductDetailPageWrapper = () => {
  const { productId, productSkuId } = useParams();

  return (
    <ProductDetailPage
      productId={parseInt(productId)}
      productSkuId={parseInt(productSkuId)}
    />
  );
};

export default ProductDetailPageWrapper;
