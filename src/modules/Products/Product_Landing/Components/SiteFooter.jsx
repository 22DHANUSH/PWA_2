import { Row, Col } from "antd";
import "../Footer.css";
 
export default function SiteFooter() {
  return (
    <footer
      className="site-footer section"
      style={{
        backgroundColor: "#fff",
        borderTop: "1px solid rgba(0,0,0,.06)",
        padding: "12px 0",
      }}
    >
      <div
        className="footer-container"
        style={{
          maxWidth: "100%",
          paddingLeft: 0,  
          paddingRight: 0,  
         
 
        }}
      >
        <Row
          align="middle"
          justify="space-between"
          style={{
            display: "flex",
            flexWrap: "wrap",
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
         
          <Col flex="1" style={{ textAlign: "left" }} >
            <div className="Col1" style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
              <div style={{ opacity: 0.6 }}>INFO</div>
              <a href="/">HOME</a>
              <a href="/about">ABOUT</a>
              <a href="/contact">CONTACT US</a>
            </div>
          </Col>
 
         
          <Col flex="none" style={{ textAlign: "center" }}>
            <img
              src="/images/Columbia-Logo2.png"
              alt="Columbia Sportswear Logo"
              className="footer-logo-img"
              style={{
                height: 110,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
 
          </Col>
 
         
          <Col flex="1" className="Col3" style={{
            textAlign: "right",
            fontSize: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: 90,
          }}>
            <div>©️ {new Date().getFullYear()} Columbia Sportswear</div>
            <div>All rights reserved.</div>
          </Col>
        </Row>
      </div>
    </footer>
  );
}
 