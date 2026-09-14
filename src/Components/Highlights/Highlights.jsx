import "./highlights.css";
// import toys from "../../assets/Images/toys.png";
// import bags from "../../assets/Images/handbags.png";
// import home from "../../assets/Images/home.png";
// import stationery from "../../assets/Images/stationery.png";

import toy from "../../assets/Videos/toys.mp4";
import stationery from "../../assets/Videos/stationery.mp4";
import bag from "../../assets/Videos/bag.mp4";
import home from "../../assets/Videos/home.mp4";

const Highlights = () => {
  return (
    <div className="highlights">
      <h1>
        Category Highlights
        <span>
          View products
          <i class="bi bi-arrow-right"></i>
        </span>
      </h1>
      <p>Explore our signature pillars of everyday quality</p>
      <section>
        <div>
          <video src={toy} autoPlay muted loop playsInline/>
          {/* <img src={toys} alt="Soft Toys" /> */}
          <div>
            <h1>Soft Toys</h1>
            <p>Cuddles guaranteed. Perfect gifts for every age.</p>
          </div>
        </div>

        <div>
          {/* <img src={home} alt="Home & Kitchen" /> */}
          <video src={home} autoPlay muted loop playsInline/>
          <div>
            <h1>Home & Kitchen</h1>
            <p>Smart essentials to make your space work better.</p>
          </div>
        </div>

        <div>
          {/* <img src={stationery} alt="Stationery Items" /> */}
          <video src={stationery} autoPlay muted loop playsInline/>
          <div>
            <h1>Stationery</h1>
            <p>For students and professionals who mean business.</p>
          </div>
        </div>

        <div>
          {/* <img src={bags} alt="Handbags" /> */}
          <video src={bag} autoPlay muted loop playsInline/>
          <div>
            <h1>Handbags</h1>
            <p>Everyday elegance for the modern woman.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Highlights;
