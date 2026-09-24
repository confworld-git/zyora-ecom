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
import "./index.css"

const App = () => {
  return (
    <BrowserRouter>
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
          <Route path="/product/:id" element={<ProductDetail />} />
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
    </BrowserRouter>
  );
};

export default App;
