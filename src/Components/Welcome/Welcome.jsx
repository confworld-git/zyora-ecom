import "./welcome.css";
import ScrollReveal from "../ScrollReveal.jsx";
import Globe from "../../assets/Images/Global.jpeg";

const pillars = ["Quality", "Functionality", "Style", "Affordability"];

const Welcome = () => {
  return (
    <ScrollReveal as="section" className="wl">
      <div className="wl-glow" aria-hidden="true" />
      <div className="wl-inner">
        <div className="wl-copy">
          <h1 style={{ "--d": ".08s" }}>
            Welcome to <span>ZYORA</span>
          </h1>
          <p className="wl-lead" style={{ "--d": ".16s" }}>
            ZYORA is a growing e-commerce brand committed to making everyday
            shopping simple, convenient and reliable. We carefully select
            products that combine quality, functionality, style and
            affordability, giving customers a seamless shopping experience
            across multiple product categories.
          </p>

          <p style={{ "--d": ".24s" }}>
            Whether you're looking for products for your home, lifestyle,
            personal needs or everyday essentials, ZYORA aims to bring useful
            products closer to you.
          </p>

          <ul className="wl-pillars" style={{ "--d": ".32s" }}>
            {pillars.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="wl-visual" style={{ "--d": ".2s" }}>
          <div className="wl-frame">
            {/* <video
              className="wl-video"
              src="https://res.cloudinary.com/yocetu59/video/upload/v1792993013/globe2.mp4"
              muted
              loop
              playsInline
              autoPlay
            /> */}
            <img
              className="wl-video"
              fetchPriority="high"
              decoding="async"
              src={Globe}
              alt="ZYORA is a growing e-commerce brand committed to making everyday shopping simple, convenient and reliable."
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default Welcome;
