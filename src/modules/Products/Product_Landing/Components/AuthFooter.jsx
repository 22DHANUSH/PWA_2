import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/images/columbialogo.png";
import "../../../../modules/Users/Auth/Auth.css";
 
export default function AuthFooter() {
  const navigate = useNavigate();
 
  return (
    <footer className="auth-footer">
      <div className="auth-footer-container">
        <div className="auth-footer-left" onClick={() => navigate("/")}>
          <img src={logo} alt="Footer Logo" className="auth-footer-logo" />
        </div>
        <div className="auth-footer-right">
          <p className="auth-footer-text">© 2025 Columbia Sportswear Company</p>
        </div>
      </div>
    </footer>
  );
}