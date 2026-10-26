import "./Home.css";
import ScrollReveal from "../ScrollReveal.jsx";
import { HiShoppingBag } from "react-icons/hi2";
import Confetti from "../../Confetti/Confetti";
import home_pro1 from "../../assets/Images/home_img.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <ScrollReveal className="home-container">
      <div className="hero-copy">
        <img
          src={home_pro1}
          alt="ZYORA | Where Everyday Meets Extraordinary"
          fetchPriority="high"
          decoding="async"
        />
        <span className="hero-eyebrow">Destination for E-commerce</span>
        <p>
          From cuddly soft toys to smart home essentials, handy stationery to
          stylish handbags discover products that make everyday life a little
          more delightful.
        </p>
        <button onClick={() => navigate("/Zyora_Category")}>
          Shop Now <HiShoppingBag />
        </button>
      </div>
      <Confetti active={true} />
    </ScrollReveal>
  );
};

export default Home;
