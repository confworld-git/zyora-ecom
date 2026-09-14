import "./why.css";
import delivery from "../../assets/Images/delivery.mp4";
import payment from "../../assets/Images/payment.mp4";
import returnp from "../../assets/Images/returnp.mp4";
import secure from "../../assets/Images/secure.mp4";

const Why = () => {
  return (
    <div className="why">
      <h1>
        Why Shop With <span>ZYORA</span>
      </h1>
      <section>
        <div>
          <video src={secure} autoPlay muted loop playsInline />
          <p>Quality-Checked Products</p>
        </div>
        <div>
          <video src={delivery} autoPlay muted loop playsInline />
          <p>Fast & Reliable Delivery</p>
        </div>
        <div>
          <video src={payment} autoPlay muted loop playsInline />
          <p>Secure Payments</p>
        </div>
        <div>
          <video src={returnp} autoPlay muted loop playsInline />
          <p>Easy 7-Day Returns</p>
        </div>
        <div>
          <video src={returnp} autoPlay muted loop playsInline />
          <p>Friendly Customer Support</p>
        </div>
      </section>
    </div>
  );
};

export default Why;
