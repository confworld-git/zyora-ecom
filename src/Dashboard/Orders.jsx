import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import "./Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`;
const config = { withCredentials: true };
const orderStatuses = ["placed", "confirmed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyOrder, setBusyOrder] = useState("");
  const [openDetailsId, setOpenDetailsId] = useState("");

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
    const closeDetailsOutside = (event) => {
      if (!event.target.closest(".order-details")) setOpenDetailsId("");
    };
    const closeDetailsOnEscape = (event) => {
      if (event.key === "Escape") setOpenDetailsId("");
    };

    document.addEventListener("pointerdown", closeDetailsOutside);
    document.addEventListener("keydown", closeDetailsOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeDetailsOutside);
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
      return matchesSearch && (filter === "all" || order.orderStatus === filter);
    });
  }, [orders, search, filter]);

  const openEditor = (order) => {
    setEditing({
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
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
          shippingAddress: editing.shippingAddress,
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

  const deleteOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.orderId}? This cannot be undone.`))
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

  const pendingCount = orders.filter((order) =>
    ["placed", "confirmed"].includes(order.orderStatus),
  ).length;
  const salesTotal = orders
    .filter((order) => order.orderStatus !== "cancelled")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">ORDER MANAGEMENT</span>
          <h1>Orders</h1>
          <p>Review customer orders, update delivery details, and manage status.</p>
        </div>
        <button className="management-refresh" onClick={fetchOrders} type="button">
          Refresh
        </button>
      </header>

      <section className="management-stats" aria-label="Order summary">
        <article><span>Total orders</span><strong>{orders.length}</strong></article>
        <article><span>Needs attention</span><strong>{pendingCount}</strong></article>
        <article><span>Order value</span><strong>{currency(salesTotal)}</strong></article>
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
            <option key={status} value={status}>{titleCase(status)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="management-empty">Loading orders…</p>
      ) : visibleOrders.length === 0 ? (
        <p className="management-empty">
          {orders.length ? "No orders match your filters." : "Orders will appear here when customers place them."}
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
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const customer = order.customer || {};
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
                          {openDetailsId === order._id ? "Hide details" : "View details"}
                          <FiChevronDown
                            className={openDetailsId === order._id ? "order-details-chevron is-open" : "order-details-chevron"}
                            aria-hidden="true"
                          />
                        </button>
                        {openDetailsId === order._id && (
                          <div className="order-detail-popover">
                          <strong>Delivery address</strong>
                          <p>
                            {order.shippingAddress?.name} · {order.shippingAddress?.mobile}<br />
                            {[
                              order.shippingAddress?.houseNumber,
                              order.shippingAddress?.address,
                              order.shippingAddress?.locality,
                              order.shippingAddress?.city,
                              order.shippingAddress?.state,
                              order.shippingAddress?.pinCode,
                            ].filter(Boolean).join(", ")}
                          </p>
                          <strong>Order items</strong>
                          {order.items?.map((item, index) => (
                            <p key={`${item.productId}-${index}`}>
                              {item.name} × {item.quantity} · {currency(item.price)}
                              {item.size && ` · ${item.size}`}
                              {item.color && ` · ${item.color}`}
                            </p>
                          ))}
                          <p>Subtotal {currency(order.subtotal)} · Shipping {currency(order.shippingFee)}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{customer.name || order.shippingAddress?.name || "Customer"}</strong>
                      <small>{customer.email || customer.mobile || "—"}</small>
                    </td>
                    <td>{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>
                    <td><strong>{currency(order.total)}</strong></td>
                    <td><span className={`management-badge status-${order.orderStatus}`}>{titleCase(order.orderStatus)}</span></td>
                    <td>{titleCase(order.paymentStatus)}<small>{titleCase(order.paymentMethod)}</small></td>
                    <td>{dateLabel(order.createdAt)}</td>
                    <td>
                      <div className="management-actions">
                        <button type="button" onClick={() => openEditor(order)}>Edit</button>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="management-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setEditing(null);
        }}>
          <form className="management-modal" onSubmit={saveOrder}>
            <div className="management-modal-heading">
              <div><span className="management-eyebrow">EDIT ORDER</span><h2>{editing.orderId}</h2></div>
              <button type="button" aria-label="Close" onClick={() => setEditing(null)}>×</button>
            </div>
            <div className="management-form-grid">
              <label>Order status
                <select value={editing.orderStatus} onChange={(event) => setEditing({ ...editing, orderStatus: event.target.value })}>
                  {orderStatuses.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                </select>
              </label>
              <label>Payment status
                <select value={editing.paymentStatus} onChange={(event) => setEditing({ ...editing, paymentStatus: event.target.value })}>
                  {paymentStatuses.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
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
                <label key={name}>{label}
                  <input
                    name={name}
                    value={editing.shippingAddress[name]}
                    onChange={updateAddress}
                    required={["name", "mobile", "address", "city", "state", "pinCode"].includes(name)}
                  />
                </label>
              ))}
            </div>
            <div className="management-modal-actions">
              <button type="button" className="management-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button type="submit" className="management-primary" disabled={saving}>{saving ? "Saving…" : "Save order"}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Orders;
