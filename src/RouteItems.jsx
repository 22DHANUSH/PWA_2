import { Routes, Route } from "react-router-dom";

// Products
import Landing from "./modules/Products/Product_Landing/Pages/Landing";
import ProductsPage from "./modules/Products/Product_Catalog/Pages/ProductsPage";
import SearchAndFilterPage from "./modules/Products/Product_Catalog/Pages/SearchAndFilterPage";
import ProductDetailPageWrapper from "./modules/Products/Product_Description/ProductDetailPageWrapper";

// Users
import Profile from "./modules/Users/Profile/Pages/Profile";
import Login from "./modules/Users/Auth/Pages/Login";
import Signup from "./modules/Users/Auth/Pages/Signup";
import ForgotPassword from "./modules/Users/Auth/Pages/ForgotPassword";
import Addresses from "./modules/Users/Addresses/Pages/Addresses";
import WishlistPage from "./modules/Users/WishlistItems/Pages/WishlistItems";

// Cart & Orders
import CartPage from "./modules/Cart/Pages/CartPage";
import OrderHistory from "./modules/Orders/OrderHistory/Pages/OrderHistory";
import OrderTracking from "./modules/Orders/OrderTracking/Pages/OrderTracking";
import OrderReview from "./modules/Orders/OrderSummary/Pages/OrderReview";
import PaymentPage from "./modules/Payment/PaymentPage";

//About and Contact Page
import AboutPage from "./pages/About/About";
import ContactPage from "./pages/Contact/ContactPage";

//Insights and Map
import Dashboard from "./modules/Insights/pages/Dashboard";
import Map from "./modules/Insights/pages/Map";

const RouteItems = () => {
  return (
    <Routes>
      {/* Landing & Products */}
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<SearchAndFilterPage />} />
      <Route
        path="/productdetails/:productId/:productSkuId"
        element={<ProductDetailPageWrapper />}
      />

      {/* User Auth & Profile */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/addresses" element={<Addresses />} />

      {/* Wishlist & Cart */}
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CartPage />} />

      {/* Orders */}
      <Route path="/my-orders" element={<OrderHistory />} />
      <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
      <Route path="/orders/summary" element={<OrderReview />} />

      {/* Payment */}
      <Route path="/payment" element={<PaymentPage />} />

      {/* Static Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/analytics" element={<Dashboard />} />

      <Route path="/map" element={<Map />} />

      {/* Optional: 404 */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
};

export default RouteItems;
