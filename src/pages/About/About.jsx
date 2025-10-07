import React from "react";
import { Typography } from "antd";
import bannerAboutUs from "/images/bannerAboutUs.jpg"; // adjust path as needed

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  return (
    <div style={{ width: "100%", backgroundColor: "#fff" }}>
      {/* Full-width banner */}
      <div style={{ width: "100%", overflow: "hidden" }}>
        <img
          src={bannerAboutUs}
          alt="About Us Banner"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "cover",
          }}
        />
      </div>


      <div
        style={{
          padding: "60px 80px",
          maxWidth: "100%",
          textAlign: "justify",
        }}
      >
        <Title level={2} style={{ marginBottom: 32, textAlign: "center" }}>
          About Us
        </Title>

        <Paragraph style={{ fontSize: 16, lineHeight: "1.8" }}>
          It all began in 1937 when Gert’s parents fled Nazi Germany and settled in Portland where they purchased a small hat manufacturer, naming it the Columbia Hat Company. Signifying a fresh start for the family, the business eventually passed from Gert’s father to her husband Neal and then to Gert herself in 1970 when she went from housewife to executive overnight after Neal’s sudden passing. Our founder Gert Boyle’s “Tough Mother” persona lives on in the Columbia brand. Her legendary perfectionism (“It’s perfect. Now make it better.”) and the high standards to which she held herself and others still guide us today. At Columbia, we’re as passionate about the outdoors as you are. And while our gear is available around the world, we’re proud to be based in the Pacific Northwest where the lush forests, snow-covered mountains, rugged coastline, and wide-open spaces serve as our playground. This is where we hike, fish, hunt, camp, climb, shred, paddle, golf, run, and just enjoy the fresh air with friends. We hope to see you out there. Way, way out there.
        </Paragraph>
      </div>
    </div>
  );
}

