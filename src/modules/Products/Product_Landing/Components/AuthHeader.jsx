import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/images/columbialogo.png";
import "../../../../modules/Users/Auth/Auth.css";
 
export default function AuthHeader() {
  const navigate = useNavigate();
 
  return (
    <header className="auth-header">
      <div className="auth-header-container">
        <div className="auth-header-left" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="auth-header-logo" />
        </div>
        <div className="auth-header-right">
          <h2 className="auth-header-title">Welcome to Columbia Sportswear Company</h2>
        </div>
      </div>
    </header>
  );
}