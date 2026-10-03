import "./PaymentSuccess.css";
import Canferri from "../../Confetti/Confetti";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unavailable";

const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function PaymentSuccess({ onDownload, onHome }) {
  const location = useLocation();
  const order = location.state?.order;
  const navigate = useNavigate();
  const { customer } = useAuth();

  const handleHome = () => {
    if (onHome) onHome();
    else navigate("/");
  };

  const address = order?.shippingAddress;
  const addressLines = address
    ? [
        address.name,
        [address.houseNumber, address.address, address.locality]
          .filter(Boolean)
          .join(", "),
        [address.city, address.state, address.pinCode]
          .filter(Boolean)
          .join(", "),
        address.mobile,
      ].filter(Boolean)
    : [];

  const orderStatus = (order?.orderStatus || "placed")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  const paymentStatus =
    order?.paymentMethod === "cod"
      ? "Due on delivery"
      : (order?.paymentStatus || "pending")
          .replaceAll("_", " ")
          .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <div className="ps-page">
      {order ? (
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
                    ORDER PLACED • THANK YOU • ORDER PLACED • THANK YOU •
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
            Order <span>placed</span>
          </h1>
          <p className="ps-sub">
            Thanks! Your order is confirmed. We’ll collect payment when it is
            delivered.
          </p>

          <section className="ps-receipt" aria-label="Order details">
            <div className="ps-amt">
              <small>Amount due</small>
              <b>{formatAmount(order.total)}</b>
            </div>
            <div className="ps-row">
              <span>Order status</span>
              <b className="ps-badge">{orderStatus}</b>
            </div>
            <div className="ps-row">
              <span>Payment</span>
              <b>{paymentStatus}</b>
            </div>
            <div className="ps-row">
              <span>Order ID</span>
              <b>{order.orderId}</b>
            </div>
            <div className="ps-row">
              <span>Date</span>
              <b>{formatDate(order.createdAt)}</b>
            </div>
            <div className="ps-row">
              <span>Method</span>
              <b>
                {order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </b>
            </div>
            {addressLines.length > 0 && (
              <div className="ps-address">
                <span>Delivery address</span>
                <address>{addressLines.join("\n")}</address>
              </div>
            )}
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
      ) : (
        <main className="ps-wrap">
          <h1>
            Order <span>details unavailable</span>
          </h1>
          <p className="ps-sub">
            No order details were provided. You can review your orders in your
            profile.
          </p>
          <div className="ps-actions">
            <button
              type="button"
              className="ps-primary"
              onClick={() =>
                navigate(
                  customer?.id
                    ? `/Profile/${customer.id}?tab=orders`
                    : "/Login",
                )
              }
            >
              View my orders
            </button>
            <button type="button" className="ps-ghost" onClick={handleHome}>
              Back to home
            </button>
          </div>
        </main>
      )}
      <Canferri active={Boolean(order)} />
    </div>
  );
}
