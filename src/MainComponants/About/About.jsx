import "./About.css";
import { FaHandsHelping } from "react-icons/fa";
// import { GiBullseye } from "react-icons/gi";
// import mission from "../../assets/Videos/mission.mp4";
import { FaTruck } from "react-icons/fa6";
import arc from "../../assets/Images/arc.png";
// import arc4 from "../../assets/Videos/arc.mp4";

const About = () => {
  return (
    <div className="About_us">
      <div className="about_title">
        <img src={arc} alt="" />
        {/* <video src={arc4} autoPlay muted loop playsInline/> */}
        <h1>Who We Are</h1>
        <p>
          Shopping should feel personal, joyful, and <br /> effortless <br />
          that's the whole idea behind ZYORA.
        </p>
      </div>
      <h1>
        Our <span>Story</span>
      </h1>
      <span>Shopping, made personal again.</span>
      <p>
        At ZYORA, we believe shopping should feel personal, joyful, and
        effortless. What started as a simple idea — to bring together the
        products people genuinely need and love — has grown into a one-stop
        destination for soft toys, home essentials, stationery, and handbags. We
        handpick every product with care, blending quality, affordability, and
        style, so whether you're decorating your kitchen, gearing up for the
        school year, gifting a loved one, or accessorizing your outfit — ZYORA
        has something for you.
      </p>
      <div className="standFor">
        <h1>
          What We <span>Stand For</span>
        </h1>
        <span>Every product, chosen with purpose.</span>
        <p>
          We handpick every single product that makes it onto ZYORA. No filler,
          no guesswork — just a careful blend of quality, affordability, and
          style in everything we offer. Because life doesn't happen in one
          category. One day you're decorating your kitchen. The next, you're
          gearing up for the school year, picking out a gift for someone you
          love, or looking for the perfect handbag to complete an outfit. ZYORA
          is built to be there for all of it.
        </p>
      </div>
      <div className="why_zyora">
        <h1>
          Why <span>ZYORA</span>
        </h1>
        <section>
          <div>
            <h1>Thoughtfully Curated</h1>
            <p>
              Every product is handpicked — not mass-added — so you always find
              things worth keeping.
            </p>
          </div>
          <div>
            <h1>Something for Every Part of Life</h1>
            <p>
              From soft toys to home essentials, stationery to handbags — ZYORA
              brings it all together in one place.
            </p>
          </div>
          <div>
            <h1>Quality Meets Affordability</h1>
            <p>
              We believe style and good pricing shouldn't be a trade-off — you
              get both, always.
            </p>
          </div>
          <div>
            <h1>Made for Real, Everyday Moments</h1>
            <p>
              Whether you're decorating, gifting, studying, or accessorizing —
              ZYORA fits right into your life.
            </p>
          </div>
        </section>
      </div>
      <section className="Our">
        {/* <div>
          <h1>
            <GiBullseye />
            Our Mission
          </h1>
          <p>
            To make everyday shopping simple, affordable, and delightful — one
            product, one customer, one smile at a time.
          </p>
          <video src={mission} autoPlay muted loop playsInline />
        </div> */}
        <div className="promise">
          <h1>
            <FaHandsHelping />
            Our Promise
          </h1>
          <p>Built on Trust & Integrity</p>
          <div>
            <div>
              <div style={{ backgroundColor: "#263a69" }}>
                <i
                  style={{ color: "#4397fd" }}
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
              <div style={{ backgroundColor: "#203f46" }}>
                <i style={{ color: "#02c4ff" }}>
                  <FaTruck />
                </i>
              </div>
              <div>
                <h1>Fast Delivery</h1>
                <p>Quick processing, reliable service, every time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
