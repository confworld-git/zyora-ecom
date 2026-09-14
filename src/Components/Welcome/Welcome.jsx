import "./welcome.css";
import globe from "../../assets/Videos/globe.mp4";

const Welcome = () => {
  return (
    <section className="Welcome_container">
      <div className="Video_container">
        <video src={globe} autoPlay muted loop playsInline />
      </div>
      <div className="Welcome_content">
        <div>
          <h1>
            Welcome to <span>ZYORA</span>
          </h1>

          <p>
            ZYORA is a growing e-commerce brand committed to making everyday
            shopping simple, convenient and reliable. We carefully select
            products that combine quality, functionality, style and
            affordability, giving customers a seamless shopping experience
            across multiple product categories.
          </p>

          <p>
            Whether you're looking for products for your home, lifestyle,
            personal needs or everyday essentials, ZYORA aims to bring useful
            products closer to you.
          </p>
        </div>
        <div className="goal-section">
          <h1>
            Our goal is <span>simple</span>
          </h1>
          <p>
            To make quality products accessible to everyone, with a shopping
            experience you can trust.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
