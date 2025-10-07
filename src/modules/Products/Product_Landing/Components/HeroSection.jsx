import { Button, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHeroImages } from "../../products.api";

export default function HeroSection() {
  const [imgs, setImgs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getHeroImages().then((data) => {
      if (mounted) {
        const uniqueImages = data.filter(
          (img, index, self) =>
            img.imageUrl &&
            self.findIndex(i => i.imageUrl === img.imageUrl) === index
        );
        setImgs(uniqueImages);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const firstImage = imgs[0];
  const secondImage = imgs[1];

  return (
    <section className="section">
      <div className="container container--bleed hero">
        <div>
          <div className="heading-xxl">
            NEW
            <br />
            COLLECTION
          </div>

          <div className="h-stack" style={{ gap: 12, marginTop: 22 }}>
            <Link to="/products">
              <Button size="large">Go To Shop</Button>
            </Link>
          </div>
        </div>


        <div
          className="tile"
          style={{ aspectRatio: "1 / 1", cursor: "pointer" }}
          onClick={() =>
            firstImage &&
            navigate(`/productdetails/${firstImage.productId}/${firstImage.productSkuId}`)
          }
        >
          {firstImage ? (
            <img src={firstImage.imageUrl} alt="Look 1" />
          ) : (
            <Skeleton.Image active style={{ width: "100%", height: "100%" }} />
          )}
        </div>


        <div
          className="tile"
          style={{ aspectRatio: "1 / 1", cursor: "pointer" }}
          onClick={() =>
            secondImage &&
            navigate(`/productdetails/${secondImage.productId}/${secondImage.productSkuId}`)
          }
        >
          {secondImage ? (
            <img src={secondImage.imageUrl} alt="Look 2" />
          ) : (
            <Skeleton.Image active style={{ width: "100%", height: "100%" }} />
          )}
        </div>
      </div>
    </section>
  );
}
