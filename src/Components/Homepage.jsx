import "../index.css";
import Home from "./Home/Home";
import Welcome from "./Welcome/Welcome";
import Highlights from "./Highlights/Highlights";
import Featured from "./Featured/Featured";
import Why from "./Why/Why";
import SEO from "../SEO.jsx";

const Homepage = () => {
  return (
    <>
      <SEO
        title="ZYORA | Quality & Affordable Products for Everyday Life"
        description="Shop at ZYORA for quality, functional and affordable products for your home, lifestyle and everyday needs. Explore soft toys, home & kitchen essentials, stationery, handbags and more, with reliable delivery, secure payments and easy 7-day returns."
        canonical="https://yourdomain.com/"
      />
      <Home />
      <Welcome />
      <Highlights />
      <Featured />
      <Why />
    </>
  );
};

export default Homepage;
