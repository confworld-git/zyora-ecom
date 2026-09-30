import "./PaymentSuccess.css";
import Canferri from "../../Confetti/Confetti";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess({
  amount = "₹2,499",
  orderId = "#ORD-48213",
  method = "UPI •• 4821",
  date = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  onDownload,
  onHome,
}) {
  const navigate = useNavigate();
  const handleHome = () => {
    if (onHome) onHome();
    else navigate("/");
  };

  return (
    <div className="ps-page">
      <main className="ps-wrap">
        <div className="ps-stamp" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path
                id="ps-ring-path"
                d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"
              />
            </defs>
            <g className="ps-ring">
              <text
                fontSize="14"
                fontWeight="700"
                letterSpacing="2.4"
                fill="#ff4000"
              >
                <textPath href="#ps-ring-path">
                  PAYMENT RECEIVED • THANK YOU • PAYMENT RECEIVED • THANK YOU •
                </textPath>
              </text>
            </g>
            <g className="ps-disc">
              <circle cx="100" cy="100" r="58" fill="#ff4000" />
              <path
                className="ps-tick"
                d="M75 101 L92 118 L126 82"
                pathLength="100"
                fill="none"
                stroke="#fff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        <h1>
          Payment <span>successful</span>
        </h1>
        <p className="ps-sub">
          Thanks! Your order is confirmed and a receipt is on its way to your
          inbox.
        </p>

        <section className="ps-receipt" aria-label="Receipt">
          <div className="ps-amt">
            <small>Amount paid</small>
            <b>{amount}</b>
          </div>
          <div className="ps-row">
            <span>Status</span>
            <b className="ps-badge">Paid</b>
          </div>
          <div className="ps-row">
            <span>Order ID</span>
            <b>{orderId}</b>
          </div>
          <div className="ps-row">
            <span>Date</span>
            <b>{date}</b>
          </div>
          <div className="ps-row">
            <span>Method</span>
            <b>{method}</b>
          </div>
        </section>

        <div className="ps-actions">
          <button type="button" className="ps-primary" onClick={onDownload}>
            Download receipt
          </button>
          <button type="button" className="ps-ghost" onClick={handleHome}>
            Back to home
          </button>
        </div>
        <p className="ps-note">
          Need help? Contact support with your order ID.
        </p>
      </main>
      <Canferri active={true} />
    </div>
  );
}
