import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Homepage from "./Components/Homepage";
import About from "./MainComponants/About/About";
import Contat from "./MainComponants/Contact/Contat.jsx";
import Cart from "./MainComponants/Cart/Cart";
import Favorites from "./MainComponants/Favorites/Favorites";
import Category from "./MainComponants/Category/Category.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import { Toaster } from "react-hot-toast";

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
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/About_Us" element={<About />} />
        <Route path="/Contact_Us" element={<Contat />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Favorites" element={<Favorites />} />
        <Route path="/Zyora_Category" element={<Category />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
