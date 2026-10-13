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

import { useAuth } from "./Context/AuthContext.jsx";

const legalSections = {
  terms: [
    {
      heading: "1. Acceptance of Terms",
      body:
        "By browsing, purchasing, or interacting with ZYORA, you agree to these Terms & Conditions and any policies referenced in them.",
    },
    {
      heading: "2. Orders and Payments",
      body:
        "Orders are subject to product availability, pricing accuracy, and successful payment confirmation. We reserve the right to cancel or refuse any order if required.",
    },
    {
      heading: "3. Shipping and Delivery",
      body:
        "Delivery timelines are estimates and may vary depending on location, logistics partners, and product availability. ZYORA cannot guarantee exact delivery dates.",
    },
    {
      heading: "4. Returns and Refunds",
      body:
        "Products are eligible for return or refund within the policy window where applicable. We will assess claim eligibility based on product condition and order details.",
    },
  ],
  privacy: [
    {
      heading: "1. Information We Collect",
      body:
        "We may collect account details, delivery information, browsing data, and customer support messages needed to process and improve your shopping experience.",
    },
    {
      heading: "2. How We Use Information",
      body:
        "Data is used to complete orders, support customer care, personalize shopping, prevent fraud, and meet legal or operational requirements.",
    },
    {
      heading: "3. Your Choices",
      body:
        "You can manage account details, communication preferences, and marketing opt-ins from your account settings or by contacting our support team.",
    },
    {
      heading: "4. Security",
      body:
        "We use reasonable safeguards to protect customer information. However, no website can guarantee absolute security of data transmitted over the internet.",
    },
  ],
};

const LegalPage = ({ title, intro, sections }) => (
  <main style={{ maxWidth: 980, margin: "72px auto", padding: "0 20px 64px" }}>
    <div
      style={{
        background: "#fffaf7",
        border: "1px solid #f2e6df",
        borderRadius: 18,
        padding: "32px 24px",
        boxShadow: "0 18px 45px rgba(32, 22, 12, 0.05)",
      }}
    >
      <p
        style={{
          margin: 0,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#b56d54",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        ZYORA
      </p>
      <h1 style={{ margin: "12px 0 8px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
        {title}
      </h1>
      {intro && (
        <p
          style={{
            margin: "0 0 24px",
            color: "#5d4b40",
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          {intro}
        </p>
      )}

      {sections.map((section) => (
        <section key={section.heading} style={{ marginTop: 20 }}>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "1.2rem",
              color: "#201810",
            }}
          >
            {section.heading}
          </h2>
          <p
            style={{
              margin: 0,
              color: "#574841",
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {section.body}
          </p>
        </section>
      ))}
    </div>
  </main>
);

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
          <Route path="/track-order" element={<Navigate to="/Profile" replace />} />
          <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
          <Route
            path="/terms-and-conditions"
            element={
              <LegalPage
                title="Terms & Conditions"
                intro="These terms outline how we provide products and services to our customers on ZYORA."
                sections={legalSections.terms}
              />
            }
          />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route
            path="/privacy-policy"
            element={
              <LegalPage
                title="Privacy Policy"
                intro="This policy explains how ZYORA handles your personal information and protects your privacy."
                sections={legalSections.privacy}
              />
            }
          />
          <Route
            path="/shipping-policy"
            element={
              <LegalPage
                title="Shipping Policy"
                intro="We aim to process and ship orders promptly, while delivery times vary by destination and product availability."
                sections={[
                  {
                    heading: "Processing",
                    body: "Orders are typically processed within the stated timeline after successful payment confirmation and address verification.",
                  },
                  {
                    heading: "Delivery",
                    body: "Shipping timelines depend on your location, courier network, and any external delays beyond our control.",
                  },
                  {
                    heading: "Tracking",
                    body: "Once your order is dispatched, tracking details will be shared through the order updates available on your ZYORA account.",
                  },
                ]}
              />
            }
          />
          <Route
            path="/return-policy"
            element={
              <LegalPage
                title="Return & Refund Policy"
                intro="We want every order to feel right. If an issue arises, we review returns and refunds according to the terms of your order and product condition."
                sections={[
                  {
                    heading: "Eligibility",
                    body: "Returns and refunds are considered only when the product is eligible under the applicable return window, condition, and reason for return.",
                  },
                  {
                    heading: "Refunds",
                    body: "If approved, refunds are processed to the original method of payment or as otherwise permitted by our payment providers and policies.",
                  },
                ]}
              />
            }
          />
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
          <Route path="/dashboard" element={<Navigate to="/Dashboard" replace />} />
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
