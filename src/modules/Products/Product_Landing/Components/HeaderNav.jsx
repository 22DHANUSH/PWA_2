import {
  HeartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  PieChartOutlined 
} from "@ant-design/icons";
import { Input, Badge } from "antd";
import { Link, useLocation } from "react-router-dom";
import Columbialogo from "/images/columbialogo.png";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useCart } from "../../../Cart/CartContext";
import "../HeaderNav.css";
 
export default function HeaderNav() {
  const location = useLocation();
  const email = useSelector((state) => state.auth.email);
  const [emailInitial, setEmailInitial] = useState("");
  const { cartCount } = useCart();
  const isLoginPage = location.pathname === "/login";
  const hideSearch = location.pathname.startsWith("/products") || isLoginPage;
  const [menuOpen, setMenuOpen] = useState(false);
 
  useEffect(() => {
    if (email && email.length > 0) {
      setEmailInitial(email.charAt(0).toUpperCase());
    } else {
      setEmailInitial("");
    }
  }, [email]);
 
  return (
    <header className="sticky-header">
      <div className="container nav-bar">
        <div className="nav-left">
          <Link to="/" aria-label="Go Home" className="nav-logo">
            <img
              src={Columbialogo}
              alt="Columbia Sportswear"
              className="logo-img"
            />
          </Link>
 
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
 
          <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>
              Collections
            </Link>
             {email == "Admin@gmail.com" ?
             <><Link to="/analytics">
              <PieChartOutlined style={{ marginRight: "6px" }} />
              Analytics
            </Link>
 
            <Link to="/map">
              <EnvironmentOutlined style={{ marginRight: "6px" }} />
              Stores Nearby
           
            </Link>
            </>
            :
            <Link to="/map">
              <EnvironmentOutlined style={{ marginRight: "6px" }} />
              Stores Nearby
            </Link>
 
            }
            

          </nav>
        </div>
 
        {!isLoginPage && (
          <div className="nav-actions">
           
           
           
            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
              <HeartOutlined />
            </Link>
            <Link to="/cart" className="icon-btn" aria-label="Cart">
              <Badge count={cartCount} offset={[0, 4]} size="small">
                <ShoppingCartOutlined style={{ fontSize: 25 }} />
              </Badge>
            </Link>
            <Link to="/Profile" className="icon-btn" aria-label="Account">
              {emailInitial ? (
                <span className="email-avatar">{emailInitial}</span>
              ) : (
                <UserOutlined />
              )}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
 