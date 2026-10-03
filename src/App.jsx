import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Jewellery from "./MainComponants/Jewellery/Jewellery.jsx";
import Profile from "./Profile/Profile.jsx";
import CustomerRoute from "./ProtectedRoute/CustomerRoute.jsx";
import "./index.css";

import { Navigate } from "react-router-dom";
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
          <Route path="/Contact_Us" element={<Contat />} />
          <Route path="/Cart" element={<Cart />} />
          <Route path="/Favorites" element={<Favorites />} />
          <Route path="/Zyora_Category" element={<Category />} />
          <Route path="/Jewellery" element={<Jewellery />} />
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
