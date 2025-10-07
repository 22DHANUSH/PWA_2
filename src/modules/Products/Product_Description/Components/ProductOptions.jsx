import React, { useState, useEffect, useRef } from "react";
import { Typography, Button, Tooltip } from "antd";
import { getImagesBySku } from "../../products.api.js";
 
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
 
const ProductOptions = ({
  skus,
  productSkuId,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  onOptionsLoaded,
}) => {
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const [price, setPrice] = useState(null);
 
  const fetchedColorsRef = useRef(new Set());
  const hasLoadedRef = useRef(false);
 
  useEffect(() => {
  hasLoadedRef.current = false;
  fetchedColorsRef.current = new Set();
  setColorImages({});
}, [productSkuId]);
 
 
 
  useEffect(() => {
    if (!skus || skus.length === 0) return;
 
    const colors = [...new Set(skus.map((sku) => sku.productColor))];
    setAvailableColors(colors);
 
    const initialSku =
      skus.find((sku) => sku.productSkuId === productSkuId) || skus[0];
    if (initialSku) {
      setSelectedColor(initialSku.productColor);
      setSelectedSize(initialSku.productSize);
      setPrice(initialSku.productPrice);
      setQuantity(1);
    }
 
    const fetchImages = async () => {
      const colorImageMap = {};
 
      await Promise.all(
        colors.map(async (color) => {
          if (fetchedColorsRef.current.has(color)) return;
 
          const skuForColor = skus.find((sku) => sku.productColor === color);
          if (skuForColor) {
            try {
              const imageData = await getImagesBySku(skuForColor.productSkuId);
              const primaryImage = imageData.find((img) => img.isPrimary) || imageData[0];
              if (primaryImage) {
                colorImageMap[color] = primaryImage.imageUrl;
                fetchedColorsRef.current.add(color);
              }
            } catch (error) {
              console.error(`Error fetching image for ${color}`, error);
            }
          }
        })
      );
 
      setColorImages((prev) => ({ ...prev, ...colorImageMap }));
 
      if (onOptionsLoaded && !hasLoadedRef.current) {
        onOptionsLoaded();
       
      }
       hasLoadedRef.current = true;
    };
 
    fetchImages();
  }, [skus,productSkuId]);
 
  useEffect(() => {
    if (!selectedColor) return;
    const sizesForColor = skus
      .filter((sku) => sku.productColor === selectedColor)
      .map((sku) => sku.productSize);
    setAvailableSizes([...new Set(sizesForColor)]);
  }, [selectedColor, skus]);
 
  const sortedSizes = [...availableSizes].sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.toUpperCase());
    const indexB = sizeOrder.indexOf(b.toUpperCase());
    return indexA - indexB;
  });
 
  return (
    <>
      <Typography.Text strong>Color:</Typography.Text>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        {availableColors.map((color, idx) => {
          const imageUrl = colorImages[color];
          return (
            <Tooltip title={color} key={idx}>
              <div
                onClick={() => setSelectedColor(color)}
                style={{
                  border: selectedColor === color ? "2px solid #1890ff" : "1px solid #ccc",
                  borderRadius: "50%",
                  width: 48,
                  height: 48,
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={color}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <Typography.Text>{color}</Typography.Text>
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>
 
      <Typography.Text strong>Size:</Typography.Text>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {sortedSizes.map((size, idx) => (
          <Button
            key={idx}
            type={selectedSize === size ? "primary" : "default"}
            style={{
              backgroundColor: selectedSize === size ? "#000" : "#fff",
              color: selectedSize === size ? "#fff" : "#000",
              border: "1px solid #000",
              minWidth: 60,
            }}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </Button>
        ))}
      </div>
 
      {price && (
        <div style={{ borderRadius: 6, display: "inline-block", marginTop: 6, marginBottom: 6 }}>
          <Typography.Text strong style={{ fontSize: 35, color: "#000" }}>
            {price}
          </Typography.Text>
        </div>
      )}
    </>
  );
};
 
export default ProductOptions;
 