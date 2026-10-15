import "./PaymentSuccess.css";
import Canferri from "../../Confetti/Confetti";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import axios from "axios";
import ScrollReveal from "../../Components/ScrollReveal.jsx";

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
  const navigate = useNavigate();
  const { customer } = useAuth();
  const orderId = new URLSearchParams(location.search).get("orderId");
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [loadError, setLoadError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/refresh-payment`,
        {},
        { withCredentials: true },
      )
      .then((response) => {
        if (!cancelled) setOrder(response.data.order);
      })
      .catch((error) => {
        console.error("Unable to load order result:", error);
        if (!cancelled) {
          setLoadError({
            orderId,
            message:
              error.response?.data?.message ||
              "Unable to load the latest order status.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, retry]);

  const currentLoadError =
    loadError?.orderId === orderId ? loadError.message : "";
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
  const isCashOnDelivery = order?.paymentMethod === "cod";
  const paymentFailed = order?.paymentStatus === "failed";
  const paymentComplete = isCashOnDelivery || order?.paymentStatus === "paid";
  const isRefunded = order?.paymentStatus === "refunded";
  const isRefunding = order?.paymentStatus === "refunding";
  const isProcessing =
    !isCashOnDelivery && !paymentFailed && !paymentComplete;
  const canRefreshStatus = isProcessing || isRefunding;

  return (
    <ScrollReveal className="ps-page">
      {loading ? (
        <main className="ps-wrap" role="status">
          <h1>Checking <span>your order</span></h1>
          <p className="ps-sub">Loading the latest payment status…</p>
        </main>
      ) : currentLoadError && !order ? (
        <main className="ps-wrap" role="alert">
          <h1>Order <span>status unavailable</span></h1>
          <p className="ps-sub">{currentLoadError}</p>
          <div className="ps-actions">
            <button
              type="button"
              className="ps-primary"
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                setRetry((current) => current + 1);
              }}
            >
              Try again
            </button>
            <button type="button" className="ps-ghost" onClick={handleHome}>
              Back to home
            </button>
          </div>
        </main>
      ) : order ? (
        <main className="ps-wrap">
          {paymentComplete && (
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
          )}

          <h1>
            {isRefunded ? (
              <>Payment <span>refunded</span></>
            ) : isRefunding ? (
              <>Payment <span>refund in progress</span></>
            ) : paymentFailed ? (
              <>Payment <span>not completed</span></>
            ) : isCashOnDelivery ? (
              <>Order <span>placed</span></>
            ) : paymentComplete ? (
              <>Payment <span>successful</span></>
            ) : (
              <>Payment <span>processing</span></>
            )}
          </h1>
          <p className="ps-sub">
            {isRefunded
              ? "Your payment arrived after the stock reservation expired, so it has been refunded."
              : isRefunding
                ? "Your payment arrived after the stock reservation expired. We are processing your refund."
              : paymentFailed
                ? "The payment was not completed. Your cart has been kept so you can try again."
                : isCashOnDelivery
                  ? "Thanks! Your order is confirmed. We’ll collect payment when it is delivered."
                  : paymentComplete
                    ? "Your payment is confirmed and your order has been placed."
                    : "Your payment is being confirmed. Check this page again shortly."}
          </p>

          <section className="ps-receipt" aria-label="Order details">
            <div className="ps-amt">
              <small>
                {isCashOnDelivery
                  ? "Amount due"
                  : isRefunded
                    ? "Amount refunded"
                    : isRefunding
                      ? "Refund in progress"
                    : paymentComplete
                      ? "Amount paid"
                      : "Order amount"}
              </small>
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
                {isCashOnDelivery
                  ? "Cash on Delivery"
                  : "Razorpay"}
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
            {paymentFailed && (
              <button
                type="button"
                className="ps-primary"
                onClick={() => navigate("/Cart")}
              >
                Return to cart
              </button>
            )}
            {/* {paymentComplete && (
              <button type="button" className="ps-primary" onClick={onDownload}>
                Download receipt
              </button>
            )} */}
            {canRefreshStatus && orderId && (
              <button
                type="button"
                className="ps-primary"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  setRetry((current) => current + 1);
                }}
              >
                {loading ? "Checking…" : "Refresh payment status"}
              </button>
            )}
            <button type="button" className="ps-ghost" onClick={handleHome}>
              Back to home
            </button>
          </div>
          {currentLoadError && (
            <p className="ps-note" role="alert">
              {currentLoadError}
            </p>
          )}
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
      <Canferri active={Boolean(order) && paymentComplete} />
    </ScrollReveal>
  );
}
