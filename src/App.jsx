import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Homepage from "./Components/Homepage";
import About from "./MainComponants/About/About";
import Contat from "./MainComponants/Contact/Contat";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/About_Us" element={<About />} />
        <Route path="/Contact_Us" element={<Contat />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
