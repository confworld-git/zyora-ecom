import "./Jewellery.css";
import ParticleBackground from "./ParticleBackground";
import { IoIosArrowDown } from "react-icons/io";
import SEO from "../../SEO";

const Jewellery = () => {
  return (
    <>
      <SEO
        title=" Imitation Jewellery for Women | Stylish & Affordable Jewellery | ZYORA"
        description="Explore stylish and affordable imitation jewellery at ZYORA. Discover elegant earrings, necklaces, bracelets, rings and more for everyday wear and special occasions."
        canonical={`${import.meta.env.VITE_API_DOMAIN}/Jewellery`}
      />
      <div className="jewellery-container">
        <ParticleBackground />
        <div>
          <div>
            <h1>Shine Your Way</h1>
            <p>
              Elegant imitation jewellery to add sparkle to every occasion. Find
              pieces that match your style, mood, and personality.
            </p>
            <div className="jewellery-categories">
              <p>Necklaces</p>
              <p>Earrings</p>
              <p>Bracelets</p>
              <p>Rings</p>
              <p>Anklets</p>
            </div>
            <button className="shop-now-button-jew">
              <IoIosArrowDown />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Jewellery;
