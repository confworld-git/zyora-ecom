import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import "../styles/Management.css";
import downloadHtmlAsPdf from "../../utils/downloadHtmlAsPdf.js";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`;
const config = { withCredentials: true };
const orderStatuses = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const paymentStatuses = ["pending", "paid", "failed", "refunding", "refunded"];

const currency = (amount) =>
  `₹${(Number(amount) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const titleCase = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

const Orders = ({ initialOrderId = "" }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialOrderId);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyOrder, setBusyOrder] = useState("");
  const [openDetailsId, setOpenDetailsId] = useState("");
  const [sendingOrder, setSendingOrder] = useState("");
  const [downloadingOrder, setDownloadingOrder] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API, config);
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const closeDetailsOnEscape = (event) => {
      if (event.key === "Escape") setOpenDetailsId("");
    };

    document.addEventListener("keydown", closeDetailsOnEscape);
    return () => {
      document.removeEventListener("keydown", closeDetailsOnEscape);
    };
  }, []);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = order.customer || {};
      const matchesSearch =
        !query ||
        [order.orderId, customer.name, customer.email, customer.mobile]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return (
        matchesSearch && (filter === "all" || order.orderStatus === filter)
      );
    });
  }, [orders, search, filter]);

  const openEditor = (order) => {
    setEditing({
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      stockReservationStatus: order.stockReservationStatus,
      shippingMethod:
        order.shippingMethod ||
        (order.shipment?.awb || order.shipment?.shipmentId
          ? "shiprocket"
          : "self"),
      trackingNumber: order.shipment?.trackingNumber || "",
      trackingUrl: order.shipment?.trackingUrl || "",
      courierName: order.shipment?.courierName || "",
      hasShipment: Boolean(order.shipment?.awb || order.shipment?.shipmentId),
      shiprocketDeletedAt: order.shipment?.shiprocketDeletedAt || null,
      shippingAddress: {
        name: order.shippingAddress?.name || "",
        mobile: order.shippingAddress?.mobile || "",
        houseNumber: order.shippingAddress?.houseNumber || "",
        address: order.shippingAddress?.address || "",
        locality: order.shippingAddress?.locality || "",
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        pinCode: order.shippingAddress?.pinCode || "",
      },
    });
  };

  const updateAddress = (event) => {
    const { name, value } = event.target;
    setEditing((current) => ({
      ...current,
      shippingAddress: { ...current.shippingAddress, [name]: value },
    }));
  };

  const saveOrder = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await axios.patch(
        `${API}/${editing._id}`,
        {
          orderStatus: editing.orderStatus,
          paymentStatus: editing.paymentStatus,
          shippingMethod: editing.shippingMethod,
          ...(editing.shippingMethod === "self" && {
            trackingNumber: editing.trackingNumber,
            trackingUrl: editing.trackingUrl,
            courierName: editing.courierName,
          }),
          ...(!editing.hasShipment && {
            shippingAddress: editing.shippingAddress,
          }),
        },
        config,
      );
      setOrders((current) =>
        current.map((order) =>
          order._id === editing._id ? response.data.order : order,
        ),
      );
      setEditing(null);
      toast.success("Order updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update order");
    } finally {
      setSaving(false);
    }
  };

  const downloadOrderInvoice = async (order) => {
    const key = `${order._id}-invoice`;
    try {
      setDownloadingOrder(key);
      await downloadHtmlAsPdf(
        `${API}/${order._id}/invoice.html`,
        `${order.orderId}-invoice.pdf`,
        "a4",
        config,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to download the invoice PDF.",
      );
    } finally {
      setDownloadingOrder("");
    }
  };

  const downloadShippingLabel = async (order) => {
    try {
      setDownloadingOrder(`${order._id}-label`);
      await downloadHtmlAsPdf(
        `${API}/${order._id}/shipping-label.html`,
        `${order.orderId}-shipping-label.pdf`,
        [101.6, 152.4],
        config,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to download the shipping label PDF",
      );
    } finally {
      setDownloadingOrder("");
    }
  };

  const markShiprocketDeleted = async (order) => {
    if (
      !window.confirm(
        `Confirm that shipment ${
          order.shipment?.awb || order.shipment?.shipmentId || ""
        } was deleted in Shiprocket? This clears its tracking details and unlocks store order updates.`,
      )
    ) {
      return;
    }
    try {
      setBusyOrder(order._id);
      const response = await axios.post(
        `${API}/${order._id}/shiprocket-deleted`,
        {},
        config,
      );
      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? response.data.order : item,
        ),
      );
      toast.success(response.data.message || "Shiprocket shipment cleared");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to update the Shiprocket shipment",
      );
      await fetchOrders();
    } finally {
      setBusyOrder("");
    }
  };

  const deleteOrder = async (order) => {
    if (
      !window.confirm(`Delete order ${order.orderId}? This cannot be undone.`)
    )
      return;
    try {
      setBusyOrder(order._id);
      await axios.delete(`${API}/${order._id}`, config);
      setOrders((current) => current.filter((item) => item._id !== order._id));
      toast.success("Order deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete order");
    } finally {
      setBusyOrder("");
    }
  };

  const sendOrderToShiprocket = async (order) => {
    try {
      setSendingOrder(order._id);
      const response = await axios.post(
        `${API}/${order._id}/send`,
        {},
        config,
      );
      setOrders((current) =>
        current.map((order) =>
          order._id === response.data.order._id ? response.data.order : order,
        ),
      );
      toast.success(
        response.data.message ||
          "Order sent to Shiprocket. Tracking starts after courier assignment.",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to create shipment.",
      );
      await fetchOrders();
    } finally {
      setSendingOrder("");
    }
  };

  const pendingCount = orders.filter((order) =>
    ["placed", "confirmed"].includes(order.orderStatus),
  ).length;
  const salesTotal = orders
    .filter(
      (order) => !["cancelled", "refunded"].includes(order.orderStatus),
    )
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">ORDER MANAGEMENT</span>
          <h1>Orders</h1>
          <p>
            Review customer orders, update delivery details, and manage status.
          </p>
        </div>
        <button
          className="management-refresh"
          onClick={fetchOrders}
          type="button"
        >
          Refresh
        </button>
      </header>

      <section className="management-stats" aria-label="Order summary">
        <article>
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>
        <article>
          <span>Needs attention</span>
          <strong>{pendingCount}</strong>
        </article>
        <article>
          <span>Order value</span>
          <strong>{currency(salesTotal)}</strong>
        </article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search orders"
          placeholder="Search order, customer, or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Filter orders by status"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {titleCase(status)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="management-empty">Loading orders…</p>
      ) : visibleOrders.length === 0 ? (
        <p className="management-empty">
          {orders.length
            ? "No orders match your filters."
            : "Orders will appear here when customers place them."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Placed</th>
                <th>Actions</th>
                <th>Shipping</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const customer = order.customer || {};
                const shippingMethod =
                  order.shippingMethod ||
                  (order.shipment?.awb || order.shipment?.shipmentId
                    ? "shiprocket"
                    : "self");
                return (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.orderId}</strong>
                      <div className="order-details">
                        <button
                          type="button"
                          className="order-details-trigger"
                          aria-expanded={openDetailsId === order._id}
                          onClick={() =>
                            setOpenDetailsId((current) =>
                              current === order._id ? "" : order._id,
                            )
                          }
                        >
                          {openDetailsId === order._id
                            ? "Hide details"
                            : "View details"}
                          <FiChevronDown
                            className={
                              openDetailsId === order._id
                                ? "order-details-chevron is-open"
                                : "order-details-chevron"
                            }
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong>
                        {customer.name ||
                          order.shippingAddress?.name ||
                          "Customer"}
                      </strong>
                      <small>{customer.email || customer.mobile || "—"}</small>
                    </td>
                    <td>
                      {order.items?.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      ) || 0}
                    </td>
                    <td>
                      <strong>{currency(order.total)}</strong>
                    </td>
                    <td>
                      <span
                        className={`management-badge status-${order.orderStatus}`}
                      >
                        {titleCase(order.orderStatus)}
                      </span>
                    </td>
                    <td>
                      {titleCase(order.paymentStatus)}
                      <small>{titleCase(order.paymentMethod)}</small>
                    </td>
                    <td>{dateLabel(order.createdAt)}</td>
                    <td>
                      <div className="management-actions">
                        <button type="button" onClick={() => openEditor(order)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          disabled={busyOrder === order._id}
                          onClick={() => deleteOrder(order)}
                        >
                          {busyOrder === order._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                    <td className="shipment-cell">
                      {shippingMethod === "self" ? (
                        <div className="shipment-assigned">
                          <span
                            className="shipment-status-dot"
                            aria-hidden="true"
                          />
                          <div>
                            <strong>Self-shipping</strong>
                            {order.shipment?.courierName && (
                              <small>{order.shipment.courierName}</small>
                            )}
                            {order.shipment?.trackingNumber ? (
                              <small>
                                Tracking: {order.shipment.trackingNumber}
                              </small>
                            ) : (
                              <small>Tracking details not added</small>
                            )}
                            {order.shipment?.status && (
                              <small>{titleCase(order.shipment.status)}</small>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {["submitting", "unknown"].includes(
                            order.shipment?.submissionState,
                          ) ? (
                            <span className="shipment-state shipment-state-pending">
                              <strong>
                                {order.shipment.submissionState === "unknown"
                                  ? "Submission needs review"
                                  : "Submission in progress"}
                              </strong>
                              <small>
                                Verify Shiprocket before attempting a retry
                              </small>
                            </span>
                          ) : order.shipment?.shipmentId ||
                            order.shipment?.awb ? (
                            <div className="shipment-assigned">
                              <span
                                className="shipment-status-dot"
                                aria-hidden="true"
                              />
                              <div>
                                <strong>
                                  {order.shipment.awb
                                    ? order.shipment.courierName ||
                                      "Courier assigned"
                                    : "Sent to Shiprocket"}
                                </strong>
                                {order.shipment.shiprocketOrderId && (
                                  <small>
                                    Shiprocket order:{" "}
                                    {order.shipment.shiprocketOrderId}
                                  </small>
                                )}
                                <small>
                                  {order.shipment.awb
                                    ? `AWB: ${order.shipment.awb}`
                                    : "Courier assignment and AWB pending"}
                                </small>
                              </div>
                            </div>
                          ) : [
                              "shipped",
                              "delivered",
                              "cancelled",
                              "refunded",
                            ].includes(order.orderStatus) ? (
                            <span className="shipment-state shipment-state-muted">
                              <strong>{titleCase(order.orderStatus)}</strong>
                              <small>No shipment details recorded</small>
                            </span>
                          ) : order.paymentMethod === "online" &&
                            order.paymentStatus !== "paid" ? (
                            <span className="shipment-state shipment-state-pending">
                              <strong>Payment pending</strong>
                              <small>Confirm payment before shipping</small>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                busyOrder === order._id ||
                                sendingOrder === order._id
                              }
                              onClick={() => sendOrderToShiprocket(order)}
                              className="shipment-send-button"
                            >
                              {sendingOrder === order._id
                                ? "Sending…"
                                : "Send to Shiprocket"}
                            </button>
                          )}
                          {order.shipment?.shipmentId || order.shipment?.awb ? (
                            <button
                              type="button"
                              className="shipment-reset-button"
                              disabled={
                                busyOrder === order._id ||
                                Boolean(order.shipment?.locked)
                              }
                              onClick={() => markShiprocketDeleted(order)}
                            >
                              {busyOrder === order._id
                                ? "Updating…"
                                : "Mark deleted in Shiprocket"}
                            </button>
                          ) : order.shipment?.shiprocketDeletedAt ? (
                            <small className="shipment-deleted-note">
                              Previous Shiprocket shipment marked deleted
                            </small>
                          ) : null}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {openDetailsId &&
        (() => {
          const order = orders.find((item) => item._id === openDetailsId);
          if (!order) return null;
          const customer = order.customer || {};
          const address = order.shippingAddress || {};
          const shippingMethod =
            order.shippingMethod ||
            (order.shipment?.awb || order.shipment?.shipmentId
              ? "shiprocket"
              : "self");
          return (
            <div
              className="management-modal-backdrop order-details-modal-backdrop"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget)
                  setOpenDetailsId("");
              }}
            >
              <section
                className="management-modal order-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
              >
                <div className="management-modal-heading">
                  <div>
                    <span className="management-eyebrow">ORDER DETAILS</span>
                    <h2 id="order-details-title">{order.orderId}</h2>
                  </div>
                  <button
                    type="button"
                    aria-label="Close order details"
                    onClick={() => setOpenDetailsId("")}
                  >
                    ×
                  </button>
                </div>
                <div className="order-details-summary">
                  <div>
                    <strong>Customer</strong>
                    <span>
                      {customer.name || address.name || "Customer"}
                    </span>
                    <span>{customer.email || customer.mobile || "—"}</span>
                  </div>
                  <div>
                    <strong>Order status</strong>
                    <span>{titleCase(order.orderStatus)}</span>
                  </div>
                  <div>
                    <strong>Payment</strong>
                    <span>
                      {titleCase(order.paymentStatus)} ·{" "}
                      {titleCase(order.paymentMethod)}
                    </span>
                  </div>
                  <div>
                    <strong>Shipping</strong>
                    <span>{titleCase(shippingMethod)}</span>
                  </div>
                  <div>
                    <strong>Placed</strong>
                    <span>{dateLabel(order.createdAt)}</span>
                  </div>
                </div>
                <div className="order-details-content">
                  <section>
                    <h3>Delivery address</h3>
                    <p>
                      <strong>{address.name || "—"}</strong>
                      {address.mobile && ` · ${address.mobile}`}
                      <br />
                      {[
                        address.houseNumber,
                        address.address,
                        address.locality,
                        address.city,
                        address.state,
                        address.pinCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </section>
                  <section>
                    <h3>Order items</h3>
                    <div className="order-details-items">
                      {(order.items || []).map((item, index) => (
                        <div key={`${item.productId}-${index}`}>
                          <span>
                            {item.name}
                            {(item.size || item.color) && (
                              <small>
                                {[item.size, item.color]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </small>
                            )}
                          </span>
                          <span>
                            {item.quantity} × {currency(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="order-document-actions">
                    <button
                      type="button"
                      disabled={downloadingOrder === `${order._id}-invoice`}
                      onClick={() => downloadOrderInvoice(order)}
                    >
                      {downloadingOrder === `${order._id}-invoice`
                        ? "Preparing invoice PDF…"
                        : "Download invoice PDF"}
                    </button>
                    <button
                      type="button"
                      disabled={downloadingOrder === `${order._id}-label`}
                      onClick={() => downloadShippingLabel(order)}
                    >
                      {downloadingOrder === `${order._id}-label`
                        ? "Preparing label PDF…"
                        : "Download label PDF"}
                    </button>
                  </div>
                  <div className="order-details-totals">
                    <span>
                      Subtotal <strong>{currency(order.subtotal)}</strong>
                    </span>
                    <span>
                      Shipping <strong>{currency(order.shippingFee)}</strong>
                    </span>
                    {Number(order.platformFee) > 0 && (
                      <span>
                        Platform fee{" "}
                        <strong>{currency(order.platformFee)}</strong>
                      </span>
                    )}
                    {Number(order.couponDiscount) > 0 && (
                      <span>
                        Discount{" "}
                        <strong>-{currency(order.couponDiscount)}</strong>
                      </span>
                    )}
                    <span className="order-details-grand-total">
                      Total <strong>{currency(order.total)}</strong>
                    </span>
                  </div>
                </div>
              </section>
            </div>
          );
        })()}

      {editing && (
        <div
          className="management-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving)
              setEditing(null);
          }}
        >
          <form className="management-modal" onSubmit={saveOrder}>
            <div className="management-modal-heading">
              <div>
                <span className="management-eyebrow">EDIT ORDER</span>
                <h2>{editing.orderId}</h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setEditing(null)}
              >
                ×
              </button>
            </div>
            <div className="management-form-grid">
              <label>
                Order status
                <select
                  value={editing.orderStatus}
                  onChange={(event) =>
                    setEditing({ ...editing, orderStatus: event.target.value })
                  }
                  disabled={
                    editing.paymentMethod === "online" &&
                    (editing.paymentStatus === "pending" ||
                      editing.stockReservationStatus === "released")
                  }
                >
                  {orderStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={
                        (editing.hasShipment &&
                          status !== editing.orderStatus) ||
                        (editing.shippingMethod === "shiprocket" &&
                          !editing.shiprocketDeletedAt &&
                          ["shipped", "delivered"].includes(status) &&
                          status !== editing.orderStatus) ||
                        (editing.paymentMethod === "online" &&
                          editing.paymentStatus === "paid" &&
                          status === "cancelled")
                      }
                    >
                      {titleCase(status)}
                    </option>
                  ))}
                </select>
              </label>
              {editing.shippingMethod === "self" && (
                <>
                  <label>
                    Carrier name
                    <input
                      value={editing.courierName}
                      maxLength={120}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          courierName: event.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </label>
                  <label>
                    Tracking number
                    <input
                      value={editing.trackingNumber}
                      maxLength={120}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          trackingNumber: event.target.value,
                        })
                      }
                      placeholder="Enter tracking ID"
                    />
                  </label>
                  <label className="management-form-wide">
                    Tracking URL
                    <input
                      type="url"
                      value={editing.trackingUrl}
                      maxLength={500}
                      onChange={(event) =>
                        setEditing({
                          ...editing,
                          trackingUrl: event.target.value,
                        })
                      }
                      placeholder="https://carrier.example/track/..."
                    />
                  </label>
                </>
              )}
              <label>
                Shipping method
                <select
                  value={editing.shippingMethod}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      shippingMethod: event.target.value,
                    })
                  }
                  disabled={editing.hasShipment}
                >
                  <option value="self">Self-shipping</option>
                  <option value="shiprocket">Shiprocket</option>
                </select>
              </label>
              <label>
                Payment status
                <select
                  value={editing.paymentStatus}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      paymentStatus: event.target.value,
                    })
                  }
                  disabled={editing.paymentMethod === "online"}
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {titleCase(status)}
                    </option>
                  ))}
                </select>
              </label>
              {[
                ["name", "Recipient name"],
                ["mobile", "Mobile number"],
                ["houseNumber", "House / flat"],
                ["address", "Street address"],
                ["locality", "Locality"],
                ["city", "City"],
                ["state", "State"],
                ["pinCode", "PIN code"],
              ].map(([name, label]) => (
                <label key={name}>
                  {label}
                  <input
                    name={name}
                    value={editing.shippingAddress[name]}
                    onChange={updateAddress}
                    disabled={editing.hasShipment}
                    required={[
                      "name",
                      "mobile",
                      "address",
                      "city",
                      "state",
                      "pinCode",
                    ].includes(name)}
                  />
                </label>
              ))}
            </div>
            <div className="management-modal-actions">
              <button
                type="button"
                className="management-secondary"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="management-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save order"}
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
};

export default Orders;
