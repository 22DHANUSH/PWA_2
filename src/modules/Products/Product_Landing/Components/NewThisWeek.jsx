import { Button, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMensCollection } from "../../products.api";

export default function MensCollection() {
  const [items, setItems] = useState(null);
  const scrollerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getMensCollection().then((data) => {
      if (mounted) setItems(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const scroll = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({
      left: (dir === "left" ? -1 : 1) * 852,
      behavior: "smooth",
    });
  };

  return (
    <section className="section">
      <div className="container">
        <div
          className="h-stack"
          style={{ justifyContent: "space-between", marginBottom: 16 }}
        >
          <div className="heading-xl">
            MEN&apos;S COLLECTION{" "}
            <span className="subtle" style={{ fontSize: 16 }}>
              ({items?.length ?? 0})
            </span>
          </div>
          <div className="controls-container">
            <Link className="subtle" to="/products?category=mens">
              See All
            </Link>
            <Button
              shape="circle"
              aria-label="Scroll left"
              icon={<LeftOutlined />}
              onClick={() => scroll("left")}
            />
            <Button
              shape="circle"
              aria-label="Scroll right"
              icon={<RightOutlined />}
              onClick={() => scroll("right")}
            />
          </div>
          {/* <div className="h-stack" style={{ gap: 8 }}>
            <Link
              className="subtle"
              style={{ marginRight: 16 }}
              to="/products?category=mens"
            >
              See All
            </Link>
            <Button
              shape="circle"
              aria-label="Scroll left"
              onClick={() => scroll("left")}
              icon={<LeftOutlined />}
            />
            <Button
              shape="circle"
              aria-label="Scroll right"
              onClick={() => scroll("right")}
              icon={<RightOutlined />}
            />
          </div> */}
        </div>

        <div className="scroller-wrap">
          <div className="scroller" ref={scrollerRef}>
            {(items ?? Array.from({ length: 6 })).map((item, idx) => {
              const key = item?.productSkuID ?? idx;
              const imageUrl = item?.imageUrl;
              const productName = item?.productName ?? "Product";
              const price = item?.price ? `$ ${item.price}` : " ";

              return (
                <div
                  key={key}
                  className="v-stack"
                  style={{ gap: 10, cursor: item ? "pointer" : "default" }}
                  onClick={() =>
                    item &&
                    navigate(
                      `/productdetails/${item.productId}/${item.productSkuID}`
                    )
                  }
                >
                  <div
                    className="tile"
                    style={{
                      height: 210,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {item ? (
                      <img
                        src={imageUrl}
                        alt={productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Skeleton.Image
                        active
                        style={{ width: "100%", height: "100%" }}
                      />
                    )}
                  </div>
                  <div style={{ fontWeight: 600 }}>{productName}</div>
                  <div className="subtle" style={{ fontWeight: 600 }}>
                    {price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
