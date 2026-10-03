import "./why.css";
import ScrollVideo from "../ScrollVideo.jsx";
import delivery from "../../assets/Videos/delivery.mp4";
import payment from "../../assets/Videos/payment.mp4";
import returnp from "../../assets/Videos/returnp.mp4";
import secure from "../../assets/Videos/secure.mp4";

const items = [
  { src: secure, text: "Quality-Checked Products" },
  { src: delivery, text: "Fast & Reliable Delivery" },
  { src: payment, text: "Secure Payments" },
  { src: returnp, text: "Easy 7-Day Returns" },
  { src: returnp, text: "Friendly Customer Support" },
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
            <ScrollVideo src={item.src} />
            <p>{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Why;
