import { useLocation } from "react-router-dom";
import RouteItems from "./RouteItems";
import { CartProvider } from "./modules/Cart/CartContext";
import HeaderNav from "./modules/Products/Product_Landing/Components/HeaderNav";
import SiteFooter from "./modules/Products/Product_Landing/Components/SiteFooter";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

export default function App() {
  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/signup", "/forgot-password"];
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <CartProvider>
      <div className="app-container">
        <ScrollToTop />
        {!shouldHideLayout && <HeaderNav />}
        <main className="main-content">
          <RouteItems />
        </main>
        {!shouldHideLayout && <SiteFooter />}
      </div>
    </CartProvider>
  );
}
