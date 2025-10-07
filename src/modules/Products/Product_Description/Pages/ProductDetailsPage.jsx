import React, { useEffect, useState } from "react";
import { Row, Col, Spin } from "antd";
import api from "../../../../app/users.axios.js";
import ProductInfo from "../Components/ProductInfo.jsx";
import ProductActions from "../Components/ProductActions.jsx";
import ProductImageGallery from "../Components/ProductImageViewer.jsx";
import ProductReviews from "../Components/ProductReviews.jsx";
import ProductOptions from "../Components/ProductOptions.jsx";
import {
  getProductById,
  getSkusByProductId,
  getReviewsByProductId,
  getImagesBySku,
} from "../../products.api.js";
import useGA4Tracking from "../../../../../useGA4Tracking.js";

const ProductDetailPage = ({ productId, productSkuId }) => {
  const [skus, setSkus] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { trackViewItem } = useGA4Tracking();
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (product == null) return;

    trackViewItem({
      productTitle: product.productName || p.productTitle,
      productPrice: Number(selectedSku.productPrice) || 0,
      productId: product.productId,
    });
  }, [product]);

  const fetchImagesForSku = async (skuId) => {
    if (!skuId) {
      console.warn("SKU ID is missing");
      setImages([]);
      setSelectedImage(null);
      return;
    }

    try {
      const response = await api.get(`/blob/GenerateSasToken/${skuId}/1`);
      const imageData = Array.isArray(response.data)
        ? response.data.slice(0, 9)
        : [];

      if (imageData.length === 0) {
        setImages([]);
        setSelectedImage(null);
        return;
      }

      setImages(imageData);

      const primaryImage =
        imageData.find((img) => img.isPrimary) || imageData[0];
      setSelectedImage(primaryImage.imageUrl);
    } catch (error) {
      console.error(
        `Failed to fetch SAS images for SKU ${skuId}:`,
        error.message
      );
      setImages([]);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skuData, productData, reviewsData] = await Promise.all([
          getSkusByProductId(productId),
          getProductById(productId),
          getReviewsByProductId(productId),
        ]);

        setSkus(Array.isArray(skuData) ? skuData : []);
        setProduct(productData || null);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        const initialSku =
          skuData.find((sku) => sku.productSkuId === productSkuId) ||
          skuData[0];
        if (initialSku) {
          setSelectedColor(initialSku.productColor);
          setSelectedSize(initialSku.productSize);
          setSelectedSku(initialSku);
          setQuantity(1);
          await fetchImagesForSku(initialSku.productSkuId);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, productSkuId]);

  useEffect(() => {
    if (!selectedColor || skus.length === 0) return;

    const skusForColor = skus.filter(
      (sku) => sku.productColor === selectedColor
    );

    if (skusForColor.length > 0) {
      const validSizes = skusForColor.map((sku) => sku.productSize);
      const sizeToUse = validSizes.includes(selectedSize)
        ? selectedSize
        : validSizes[0];

      setSelectedSize(sizeToUse);

      const matchedSku = skusForColor.find(
        (sku) => sku.productSize === sizeToUse
      );
      if (matchedSku) {
        setSelectedSku(matchedSku);
        setQuantity(1);
        fetchImagesForSku(matchedSku.productSkuId);
      }
    }
  }, [selectedColor]);

  useEffect(() => {
    if (!selectedSize || !selectedColor || skus.length === 0) return;

    const matchedSku = skus.find(
      (sku) =>
        sku.productColor === selectedColor && sku.productSize === selectedSize
    );

    if (matchedSku) {
      setSelectedSku(matchedSku);
      setQuantity(1);
      fetchImagesForSku(matchedSku.productSkuId);
    }
  }, [selectedSize]);

  if (loading || !selectedSku) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "0 2rem", marginTop: "2rem" }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <ProductImageGallery
              selectedImage={selectedImage}
              images={images}
              onSelectImage={setSelectedImage}
            />
          </Col>

          <Col xs={24} md={12}>
            {product && (
              <>
                <ProductInfo product={product} />

                {selectedSku && (
                  <ProductOptions
                    productId={productId}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    stock={selectedSku?.stocks ?? 0}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    setSelectedSku={setSelectedSku}
                    skus={skus}
                  />
                )}

                <ProductActions
                  stock={selectedSku.stocks}
                  price={selectedSku.productPrice}
                  userId={userId}
                  productSkuId={selectedSku.productSkuId}
                  product={{
                    productId: product.productId,
                    productTitle: product.productName,
                    productPrice: selectedSku.productPrice,
                    productSize: selectedSku.productSize,
                    productColor: selectedSku.productColor,
                    imageUrl: images[0]?.imageUrl || "",
                  }}
                />
              </>
            )}
          </Col>
        </Row>

        <ProductReviews
          reviews={reviews}
          setReviews={setReviews}
          selectedSku={selectedSku}
          currentUserId={1}
        />
      </div>
    </>
  );
};

export default ProductDetailPage;
