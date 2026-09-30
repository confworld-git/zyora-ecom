import "./welcome.css";
import ScrollVideo from "../ScrollVideo";

const pillars = ["Quality", "Functionality", "Style", "Affordability"];

const Welcome = () => {
  return (
    <section className="wl">
      <div className="wl-glow" aria-hidden="true" />

      <div className="wl-inner">
        <div className="wl-copy">
          <span className="wl-eyebrow" style={{ "--d": "0s" }}>
            <i /> About us
          </span>

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
            <ScrollVideo
              className="wl-video"
              src="https://res.cloudinary.com/zyora/video/upload/v1790328170/globe2_lgz10s.mp4"
            />
          </div>

          <div className="wl-goal">
            <small>Our mission</small>
            <h2>
              Our goal is <span>simple</span>
            </h2>
            <p>
              To make quality products accessible to everyone, with a shopping
              experience you can trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
