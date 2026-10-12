import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext.jsx";
import "./PaymentSuccess.css";
import "./PaymentFailure.css";

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

const formatStatus = (value) =>
  (value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer } = useAuth();
  const orderId =
    new URLSearchParams(location.search).get("orderId") ||
    location.state?.order?.orderId;
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [loadError, setLoadError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!orderId) return undefined;
    let cancelled = false;
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/refresh-payment`,
        {},
        { withCredentials: true },
      )
      .then((response) => {
        if (cancelled) return;
        const latestOrder = response.data.order;
        if (
          ["paid", "refunding", "refunded"].includes(
            latestOrder?.paymentStatus,
          )
        ) {
          navigate(
            `/Payment_result?orderId=${encodeURIComponent(orderId)}`,
            { replace: true, state: { order: latestOrder } },
          );
          return;
        }
        setOrder(latestOrder);
      })
      .catch((error) => {
        console.error("Unable to load failed payment order:", error);
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
  }, [navigate, orderId, retry]);

  const currentLoadError =
    loadError?.orderId === orderId ? loadError.message : "";
  const paymentStatus = order?.paymentStatus || "pending";
  const paymentFailed = paymentStatus === "failed";
  const paymentPending = paymentStatus === "pending";
  const canRefreshStatus =
    order?.paymentMethod === "online" && Boolean(orderId);
  const failureReason = location.state?.reason;

  const retryPayment = () => navigate("/Cart");
  const viewOrders = () =>
    navigate(
      customer?.customerId
        ? `/Profile/${customer.customerId}?tab=orders`
        : "/Login",
    );

  return (
    <div className="ps-page pf-page">
      {loading ? (
        <main className="ps-wrap" role="status">
          <h1>
            Checking <span>your payment</span>
          </h1>
          <p className="ps-sub">Confirming the latest status with the payment provider…</p>
        </main>
      ) : currentLoadError && !order ? (
        <main className="ps-wrap" role="alert">
          <h1>
            Payment <span>status unavailable</span>
          </h1>
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
              Check again
            </button>
            <button type="button" className="ps-ghost" onClick={retryPayment}>
              Return to cart
            </button>
          </div>
        </main>
      ) : order ? (
        <main className="ps-wrap">
          <div className="pf-stamp" aria-hidden="true">
            <svg viewBox="0 0 200 200">
              <circle className="pf-ring" cx="100" cy="100" r="88" />
              <circle className="pf-disc" cx="100" cy="100" r="60" />
              <path
                className="pf-cross-line pf-cross-first"
                d="M78 78 L122 122"
                pathLength="100"
              />
              <path
                className="pf-cross-line pf-cross-second"
                d="M122 78 L78 122"
                pathLength="100"
              />
            </svg>
          </div>

          <h1>
            Payment{" "}
            <span>
              {paymentFailed
                ? "not completed"
                : paymentPending
                  ? "status pending"
                  : "needs attention"}
            </span>
          </h1>
          <p className="ps-sub">
            {paymentFailed
              ? "Your payment was not completed. Your cart is unchanged, so you can safely try again."
              : paymentPending
                ? "We couldn't confirm the final payment status yet. Check again before starting another payment."
                : "We couldn't confirm the payment status. Please check your order details or contact support."}
          </p>

          <section className="ps-receipt" aria-label="Order details">
            <div className="ps-amt">
              <small>Order amount</small>
              <b>{formatAmount(order.total)}</b>
            </div>
            <div className="ps-row">
              <span>Payment</span>
              <b className="ps-badge">{formatStatus(paymentStatus)}</b>
            </div>
            <div className="ps-row">
              <span>Order status</span>
              <b>{formatStatus(order.orderStatus)}</b>
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
              <b>{order.paymentMethod === "online" ? "Razorpay" : "Cash on Delivery"}</b>
            </div>
          </section>

          {failureReason && (
            <p className="pf-reason" role="note">
              {failureReason}
            </p>
          )}

          <div className="ps-actions">
            <button
              type="button"
              className="ps-primary"
              onClick={retryPayment}
            >
              Try payment again
            </button>
            {canRefreshStatus && (
              <button
                type="button"
                className="ps-ghost"
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
            <button type="button" className="ps-ghost" onClick={viewOrders}>
              View my orders
            </button>
            <button type="button" className="ps-ghost" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>
          {currentLoadError && (
            <p className="ps-note" role="alert">
              {currentLoadError}
            </p>
          )}
          <p className="ps-note">
            If your account was charged, contact support with this order ID.
          </p>
        </main>
      ) : (
        <main className="ps-wrap">
          <h1>
            Payment <span>could not be confirmed</span>
          </h1>
          <p className="ps-sub">
            No order details were provided. Review your orders or return to your
            cart to try again.
          </p>
          <div className="ps-actions">
            <button type="button" className="ps-primary" onClick={retryPayment}>
              Return to cart
            </button>
            <button type="button" className="ps-ghost" onClick={viewOrders}>
              View my orders
            </button>
          </div>
        </main>
      )}
    </div>
  );
}