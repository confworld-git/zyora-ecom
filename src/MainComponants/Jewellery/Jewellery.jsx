import "./Jewellery.css";
import ParticleBackground from "./ParticleBackground";
import { IoIosArrowDown } from "react-icons/io";

const Jewellery = () => {
  return (
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
  );
};

export default Jewellery;
