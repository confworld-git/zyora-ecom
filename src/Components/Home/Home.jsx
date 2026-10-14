import "./Home.css";
import { HiShoppingBag } from "react-icons/hi2";
import Confetti from "../../Confetti/Confetti";
import home_pro1 from "../../assets/Images/home_img.png";
import toy from "../../assets/Images/toy.png";

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-copy">
        <img src={home_pro1} alt="" />
        <h1>
          Welcome to <span>ZYORA</span>
          <br />
          Where Everyday Meets Extraordinary
        </h1>
        <span className="hero-eyebrow">Destination for E-commerce</span>
        <p>
          From cuddly soft toys to smart home essentials, handy stationery to
          stylish handbags discover products that make everyday life a little
          more delightful.
        </p>
        <button>
          Shop Now <HiShoppingBag />
        </button>
      </div>
      {/* <div className="hero-grid" aria-label="Featured categories">
        <div className="hero-tile hero-tile--handbags">
          <span className="hero-tile-number">01</span>
          <div>
            <h2>Handbags</h2>
          </div>
        </div>
        <div className="hero-tile hero-tile--soft-toys">
          <span className="hero-tile-number">02</span>
          <img src={toy} alt="Soft Toys" className="soft-toys-image" />
          <h2>Soft Toys</h2>
        </div>
        <div className="hero-tile hero-tile--home">
          <span className="hero-tile-number">03</span>
          <img src={home_pro1} alt="Home" className="soft-toys-image" />
          <h2>Products</h2>
        </div>
        <div className="hero-tile hero-tile--new-drop">
          <div>
            <h2>New drop this week</h2>
            <p>Fresh finds, just landed.</p>
          </div>
          <span aria-hidden="true">↗</span>
        </div>
      </div> */}
      <Confetti active={true} />
    </div>
  );
};

export default Home;
