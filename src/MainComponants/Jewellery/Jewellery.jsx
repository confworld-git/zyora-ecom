import "./Jewellery.css";
import ParticleBackground from "./ParticleBackground";
import { IoIosArrowRoundForward } from "react-icons/io";

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
          <button className="shop-now-button-jew">
            Shop Now <IoIosArrowRoundForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Jewellery;
