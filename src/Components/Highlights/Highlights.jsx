import "./highlights.css";
import { Link } from "react-router-dom";
import toy from "../../assets/Videos/toys.mp4";
import stationery from "../../assets/Videos/stationery.mp4";
import bag from "../../assets/Videos/bag.mp4";
import home from "../../assets/Videos/home.mp4";

const categories = [
  {
    src: toy,
    title: "Soft Toys",
    text: "Cuddles guaranteed. Perfect gifts for every age.",
  },
  {
    src: home,
    title: "Home & Kitchen",
    text: "Smart essentials to make your space work better.",
  },
  {
    src: stationery,
    title: "Stationery",
    text: "For students and professionals who mean business.",
  },
  {
    src: bag,
    title: "Fashion",
    text: "Everyday elegance for the modern women.",
  },
];

const Highlights = () => {
  return (
    <div className="highlights">
      <div>
        <h1>
          Category <span>Highlights</span>
        </h1>
        <Link className="explore_category_link" to="/Zyora_Category">
          View products
          <i className="bi bi-arrow-right" aria-hidden="true"></i>
        </Link>
      </div>
      <p>Explore our signature pillars of everyday quality</p>
      <section>
        {categories.map((item) => (
          <div key={item.title}>
            <video src={item.src} muted autoPlay loop playsInline />
            <div>
              <h1>{item.title}</h1>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Highlights;
