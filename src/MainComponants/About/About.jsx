import "./About.css";
import { FaHandsHelping } from "react-icons/fa";
import { GiBullseye } from "react-icons/gi";
import mission from "../../assets/Videos/mission.mp4";

const About = () => {
  return (
    <div className="About_us">
      <h1>
        Our <span>Story</span>
      </h1>
      <p>
        At ZYORA, we believe shopping should feel personal, joyful, and
        effortless. What started as a simple idea — to bring together the
        products people genuinely need and love — has grown into a one-stop
        destination for soft toys, home essentials, stationery, and handbags.
      </p>
      <p>
        We handpick every product with care, blending quality, affordability,
        and style, so whether you're decorating your kitchen, gearing up for the
        school year, gifting a loved one, or accessorizing your outfit — ZYORA
        has something for you.
      </p>
      <section className="Our">
        <div>
          <h1>
            <GiBullseye />
            Our Mission
          </h1>
          <p>
            To make everyday shopping simple, affordable, and delightful — one
            product, one customer, one smile at a time.
          </p>
          <video src={mission} autoPlay muted loop playsInline />
        </div>
        <div className="promise">
          <h1>
            <FaHandsHelping />
            Our Promise
          </h1>
          <p>Built on Trust & Integrity</p>
          <div>
            <div style={{ backgroundColor: "#263a69" }}>
              <i
                style={{ color: "#60A5FA" }}
                class="bi bi-shield-fill-check"
              ></i>
            </div>
            <div>
              <h1>Quality First</h1>
              <p>Every product is checked before it reaches you.</p>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: "#3D3224" }}>
              <i style={{ color: "#FBBF24" }} class="bi bi-tags-fill"></i>
            </div>
            <div>
              <h1>Honest Pricing</h1>
              <p>No hidden costs, no gimmicks.</p>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: "#0F373C" }}>
              <i style={{ color: "#34D399" }} class="bi bi-headset"></i>
            </div>
            <div>
              <h1>Customer Care</h1>
              <p>Real people, ready to help.</p>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: "#240c3a" }}>
              <i style={{ color: "#9130ff" }} class="bi bi-truck"></i>
            </div>
            <div>
              <h1>Fast Delivery</h1>
              <p>Quick processing, reliable service, every time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
