import "./Home.css";
import softtoys from "../../assets/Logo/soft_toys.png";
import { HiShoppingBag } from "react-icons/hi2";
import Confetti from "../../Confetti/Confetti";

const Home = () => {
  return (
    <div className="home-container">
      <div className="image-wrapper">
        <img src={softtoys} alt="Soft Toys" className="soft-toys-image" />
      </div>
      <h1>
        Welcome to <span>ZYORA</span> <br /> Where Everyday Meets Extraordinary
      </h1>
      <span>Destination for E-commerce</span>
      <p>
        From cuddly soft toys to smart home essentials, handy stationery to
        stylish handbags <br /> discover products that make everyday life a
        little more delightful.
      </p>
      <button>
        Shop Now <HiShoppingBag />
      </button>
      <Confetti active={true} />
    </div>
  );
};

export default Home;
