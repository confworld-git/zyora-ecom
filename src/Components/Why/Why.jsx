import "./why.css";
import delivery from "../../assets/Videos/delivery.mp4";
import returnp from "../../assets/Videos/return.mp4";
import secure from "../../assets/Videos/secure.mp4";
import quality from "../../assets/Videos/quality.mp4";
import customer from "../../assets/Videos/customer.mp4";

const items = [
  { src: quality, text: "Quality-Checked Products" },
  { src: delivery, text: "Fast & Reliable Delivery" },
  { src: secure, text: "Secure Payments" },
  { src: returnp, text: "Easy 7-Day Returns" },
  { src: customer, text: "Friendly Customer Support" },
];

const Why = () => {
  return (
    <div className="why">
      <h1>
        Why Shop With <span>ZYORA</span>
      </h1>
      <section>
        {items.map((item) => (
          <div key={item.text}>
            <video src={item.src} autoPlay muted loop playsInline preload="metadata" />
            <p>{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Why;
