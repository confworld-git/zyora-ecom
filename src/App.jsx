import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./Components/Homepage";
import About from "./MainComponants/About/About";
import Contat from "./MainComponants/Contact/Contat.jsx";
import Cart from "./MainComponants/Cart/Cart";
import Favorites from "./MainComponants/Favorites/Favorites";
import Category from "./MainComponants/Category/Category.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import Login from "./Login/Login.jsx";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./ProtectedRoute/PublicRoute.jsx";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute.jsx";
import Layout from "./ProtectedRoute/Layout.jsx";
import ProductDetail from "./MainComponants/ProductDetail/ProductDetail.jsx";
import PaymentSuccess from "./MainComponants/Success/PaymentSuccess.jsx";
import PaymentFailure from "./MainComponants/Success/PaymentFailure.jsx";
import Jewellery from "./MainComponants/Jewellery/Jewellery.jsx";
import Profile from "./Profile/Profile.jsx";
import CustomerRoute from "./ProtectedRoute/CustomerRoute.jsx";
import "./index.css";
import Policies from "./Components/Policies/Policies.jsx";

import { useAuth } from "./Context/AuthContext.jsx";

export const ProfileRedirect = () => {
  const { customer } = useAuth();
  return <Navigate to={`/Profile/${customer.customerId}`} replace />;
};

export const AppRoutes = () => {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontFamily: "'Poppins', sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            padding: "12px 16px",
            borderRadius: "8px",
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/About_Us" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact_Us" element={<Contat />} />
          <Route path="/contact" element={<Contat />} />
          <Route path="/Contact" element={<Contat />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/Favorites" element={<Favorites />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/Zyora_Category" element={<Category />} />
          <Route path="/Zyora_Category" element={<Category />} />
          <Route path="/shop" element={<Category />} />
          <Route path="/products" element={<Category />} />
          <Route path="/Jewellery" element={<Jewellery />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/orders" element={<Navigate to="/Profile" replace />} />
          <Route
            path="/track-order"
            element={<Navigate to="/Profile" replace />}
          />
          <Route
            path="/terms"
            element={<Navigate to="/policies?policy=terms" replace />}
          />
          <Route
            path="/terms-and-conditions"
            element={<Navigate to="/policies?policy=terms" replace />}
          />
          <Route
            path="/privacy"
            element={<Navigate to="/policies?policy=privacy" replace />}
          />
          <Route
            path="/privacy-policy"
            element={<Navigate to="/policies?policy=privacy" replace />}
          />
          <Route
            path="/shipping-policy"
            element={<Navigate to="/policies?policy=shipping" replace />}
          />
          <Route
            path="/return-policy"
            element={<Navigate to="/policies?policy=returns" replace />}
          />
          <Route path="/policies" element={<Policies />} />
          <Route
            path="/Profile"
            element={
              <CustomerRoute>
                <ProfileRedirect />
              </CustomerRoute>
            }
          />
          <Route
            path="/Profile/:customerId"
            element={
              <CustomerRoute>
                <Profile />
              </CustomerRoute>
            }
          />
          <Route
            path="/Zyora_Category/product/:productId/:slug"
            element={<ProductDetail />}
          />
          <Route path="/Payment_result" element={<PaymentSuccess />} />
          <Route path="/Payment_result" element={<PaymentSuccess />} />
          <Route path="/payment_result" element={<PaymentSuccess />} />
          <Route path="/Payment_failure" element={<PaymentFailure />} />
          <Route path="/payment_failure" element={<PaymentFailure />} />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<Navigate to="/Login" replace />} />
          <Route
            path="/dashboard"
            element={<Navigate to="/Dashboard" replace />}
          />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
