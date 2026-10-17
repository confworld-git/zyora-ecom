import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/admin/orders`;
const COURIER_API = `${import.meta.env.VITE_API_BASE_URL}/api/admin/couriers`;
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
  const [shipmentOrder, setShipmentOrder] = useState(null);
  const [availableCouriers, setAvailableCouriers] = useState([]);
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const [packageDetails, setPackageDetails] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });
  const [courierAvailabilityChecked, setCourierAvailabilityChecked] =
    useState(false);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [courierLoadError, setCourierLoadError] = useState("");
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [documentOperation, setDocumentOperation] = useState("");
  const [pickupOrderId, setPickupOrderId] = useState("");

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
      hasShipment: Boolean(order.shipment?.awb || order.shipment?.shipmentId),
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

  const downloadShipmentDocument = async (order, documentName) => {
    const key = `${order._id}:${documentName}`;
    const documentWindow = window.open("about:blank", "_blank");
    if (!documentWindow) {
      toast.error("Allow pop-ups to open the shipment document.");
      return;
    }
    documentWindow.opener = null;

    try {
      setDocumentOperation(key);
      const response = await axios.get(
        `${API}/${order._id}/${documentName}`,
        config,
      );
      if (!response.data?.url) {
        throw new Error("Shiprocket did not return a document link.");
      }
      documentWindow.location.replace(response.data.url);
    } catch (error) {
      documentWindow.close();
      toast.error(
        error.response?.data?.error ||
          error.message ||
          `Unable to generate the ${documentName}.`,
      );
    } finally {
      setDocumentOperation("");
    }
  };

  const retryPickup = async (order) => {
    try {
      setPickupOrderId(order._id);
      const response = await axios.post(
        `${API}/${order._id}/pickup`,
        {},
        config,
      );
      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? response.data.order : item,
        ),
      );
      toast.success("Pickup scheduled.");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Unable to schedule courier pickup.",
      );
    } finally {
      setPickupOrderId("");
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

  const openCourierSelection = (order) => {
    const deliveryPin = String(order.shippingAddress?.pinCode || "").trim();
    if (!/^\d{6}$/.test(deliveryPin)) {
      toast.error("This order does not have a valid delivery PIN code.");
      return;
    }

    setShipmentOrder(order);
    setAvailableCouriers([]);
    setSelectedCourierId("");
    setPackageDetails({
      length: order.shipment?.package?.length
        ? String(order.shipment.package.length)
        : "",
      breadth: order.shipment?.package?.breadth
        ? String(order.shipment.package.breadth)
        : "",
      height: order.shipment?.package?.height
        ? String(order.shipment.package.height)
        : "",
      weight: order.shipment?.package?.weight
        ? String(order.shipment.package.weight)
        : "",
    });
    setCourierAvailabilityChecked(false);
    setCourierLoadError("");
  };

  const updatePackageDetails = (event) => {
    const { name, value } = event.target;
    setPackageDetails((current) => ({ ...current, [name]: value }));
    setAvailableCouriers([]);
    setSelectedCourierId("");
    setCourierAvailabilityChecked(false);
    setCourierLoadError("");
  };

  const checkCourierAvailability = async (event) => {
    event.preventDefault();
    if (
      Object.values(packageDetails).some(
        (value) => !Number.isFinite(Number(value)) || Number(value) <= 0,
      )
    ) {
      toast.error(
        "Enter a positive value for each package measurement and weight.",
      );
      return;
    }

    try {
      setCourierAvailabilityChecked(false);
      setAvailableCouriers([]);
      setSelectedCourierId("");
      setCourierLoadError("");
      setLoadingCouriers(true);
      const response = await axios.get(`${COURIER_API}/serviceable`, {
        ...config,
        params: {
          delivery: String(shipmentOrder.shippingAddress.pinCode).trim(),
          weight: Number(packageDetails.weight),
          cod: shipmentOrder.paymentMethod === "cod" ? 1 : 0,
          length: Number(packageDetails.length),
          breadth: Number(packageDetails.breadth),
          height: Number(packageDetails.height),
        },
      });
      const couriers = response.data.couriers;
      if (!Array.isArray(couriers)) {
        throw new Error("Courier availability response was invalid");
      }
      setCourierAvailabilityChecked(true);
      setAvailableCouriers(couriers);
      if (couriers.length === 0) {
        toast.error("No courier partners serve this delivery PIN code.");
      }
    } catch (error) {
      const message =
        error.response?.data?.error || "Unable to load serviceable couriers.";
      setCourierAvailabilityChecked(true);
      setCourierLoadError(message);
      toast.error(message);
    } finally {
      setLoadingCouriers(false);
    }
  };

  const createShipment = async () => {
    if (!shipmentOrder || !selectedCourierId) {
      toast.error("Select a courier before creating the shipment.");
      return;
    }

    try {
      setCreatingShipment(true);
      const response = await axios.post(
        `${API}/${shipmentOrder._id}/ship`,
        {
          courierId: selectedCourierId,
          length: Number(packageDetails.length),
          breadth: Number(packageDetails.breadth),
          height: Number(packageDetails.height),
          weight: Number(packageDetails.weight),
        },
        config,
      );
      setOrders((current) =>
        current.map((order) =>
          order._id === shipmentOrder._id ? response.data.order : order,
        ),
      );
      setShipmentOrder(null);
      if (response.data.pickupWarning) {
        toast(response.data.pickupWarning);
      } else {
        toast.success("Shipment created and courier assigned.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to create shipment.",
      );
    } finally {
      setCreatingShipment(false);
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
                <th>Select Shipment</th>
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
                        {openDetailsId === order._id && (
                          <div className="order-detail-popover">
                            <strong>Delivery address</strong>
                            <p>
                              {order.shippingAddress?.name} ·{" "}
                              {order.shippingAddress?.mobile}
                              <br />
                              {[
                                order.shippingAddress?.houseNumber,
                                order.shippingAddress?.address,
                                order.shippingAddress?.locality,
                                order.shippingAddress?.city,
                                order.shippingAddress?.state,
                                order.shippingAddress?.pinCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <strong>Order items</strong>
                            {order.items?.map((item, index) => (
                              <p key={`${item.productId}-${index}`}>
                                {item.name} × {item.quantity} ·{" "}
                                {currency(item.price)}
                                {item.size && ` · ${item.size}`}
                                {item.color && ` · ${item.color}`}
                              </p>
                            ))}
                            <p>
                              Subtotal {currency(order.subtotal)} · Shipping{" "}
                              {currency(order.shippingFee)}
                            </p>
                          </div>
                        )}
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
                      {order.shipment?.awb ? (
                        <div className="shipment-assigned">
                          <span className="shipment-status-dot" aria-hidden="true" />
                          <div>
                            <strong>
                              {order.shipment.courierName || "Assigned"}
                            </strong>
                            <small>AWB: {order.shipment.awb}</small>
                            <small>
                              {order.shipment.pickupScheduled
                                ? "Pickup scheduled"
                                : "Pickup not scheduled"}
                            </small>
                          </div>
                          <div className="shipment-document-actions">
                            {["label", "invoice", "manifest"].map((name) => (
                              <button
                                type="button"
                                key={name}
                                disabled={Boolean(documentOperation)}
                                onClick={() =>
                                  downloadShipmentDocument(order, name)
                                }
                              >
                                {documentOperation === `${order._id}:${name}`
                                  ? "Preparing…"
                                  : titleCase(name)}
                              </button>
                            ))}
                            {!order.shipment.pickupScheduled && (
                              <button
                                type="button"
                                disabled={Boolean(pickupOrderId)}
                                onClick={() => retryPickup(order)}
                              >
                                {pickupOrderId === order._id
                                  ? "Scheduling…"
                                  : "Retry pickup"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : [
                            "shipped",
                            "delivered",
                            "cancelled",
                            "refunded",
                          ].includes(
                            order.orderStatus,
                          ) ? (
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
                          disabled={busyOrder === order._id}
                          onClick={() => openCourierSelection(order)}
                          className="shipment-select-button"
                        >
                          Choose courier
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                        (["shipped", "delivered"].includes(status) &&
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

      {shipmentOrder && (
        <div
          className="management-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creatingShipment &&
              !loadingCouriers
            ) {
              setShipmentOrder(null);
            }
          }}
        >
          <section
            className="management-modal courier-selection-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="courier-selection-title"
          >
            <div className="management-modal-heading">
              <div className="courier-modal-title">
                <span className="management-eyebrow">SHIPMENT · STEP 1 OF 2</span>
                <h2 id="courier-selection-title">Choose a courier</h2>
                <div className="courier-order-meta">
                  <span>Order {shipmentOrder.orderId}</span>
                  <span className="courier-meta-divider" aria-hidden="true" />
                  <span>
                    Deliver to <strong>{shipmentOrder.shippingAddress?.pinCode}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="courier-modal-close"
                aria-label="Close"
                disabled={creatingShipment || loadingCouriers}
                onClick={() => setShipmentOrder(null)}
              >
                ×
              </button>
            </div>

            <form
              className="courier-package-form"
              onSubmit={checkCourierAvailability}
            >
              <div className="courier-package-heading">
                <div>
                  <h3>Package details</h3>
                  <p>Enter the packed parcel size and weight to compare rates.</p>
                </div>
                <span className="courier-package-unit">CM · KG</span>
              </div>
              <div className="courier-package-grid">
                {[
                  ["length", "Length", "cm"],
                  ["breadth", "Breadth", "cm"],
                  ["height", "Height", "cm"],
                  ["weight", "Weight", "kg"],
                ].map(([name, label, unit]) => (
                  <label className="courier-package-field" key={name}>
                    <span>{label}</span>
                    <span className="courier-input-with-unit">
                      <input
                        type="number"
                        name={name}
                        min="0.01"
                        max={name === "weight" ? "100" : "500"}
                        step="any"
                        value={packageDetails[name]}
                        onChange={updatePackageDetails}
                        disabled={loadingCouriers || creatingShipment}
                        required
                      />
                      <span>{unit}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="courier-check-button"
                disabled={loadingCouriers || creatingShipment}
              >
                {loadingCouriers
                  ? "Finding available couriers…"
                  : "Find available couriers"}
              </button>
            </form>

            {loadingCouriers ? (
              <div className="courier-availability-state" role="status">
                <span className="courier-state-indicator courier-state-loading" />
                <div>
                  <strong>Checking courier rates</strong>
                  <p>Finding services for this route and package.</p>
                </div>
              </div>
            ) : !courierAvailabilityChecked ? (
              <div className="courier-availability-state">
                <span className="courier-state-indicator" />
                <div>
                  <strong>Courier options will appear here</strong>
                  <p>Complete the package details, then check availability.</p>
                </div>
              </div>
            ) : courierLoadError ? (
              <div
                className="courier-availability-state courier-state-error"
                role="alert"
              >
                <span className="courier-state-indicator" />
                <div>
                  <strong>Could not load courier options</strong>
                  <p>{courierLoadError}</p>
                </div>
              </div>
            ) : availableCouriers.length === 0 ? (
              <div className="courier-availability-state courier-state-empty">
                <span className="courier-state-indicator" />
                <div>
                  <strong>No couriers found for this package</strong>
                  <p>Try checking the delivery PIN or package weight.</p>
                </div>
              </div>
            ) : (
              <div className="courier-results">
                <div className="courier-results-heading">
                  <div>
                    <h3>Available services</h3>
                    <p>Select one option to continue.</p>
                  </div>
                  <span className="courier-results-count">
                    {availableCouriers.length}{" "}
                    {availableCouriers.length === 1 ? "option" : "options"}
                  </span>
                </div>
                <div className="management-table-wrap">
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th scope="col">Select</th>
                        <th scope="col">Courier partner</th>
                        <th scope="col">Rate</th>
                        <th scope="col">Delivery estimate</th>
                        <th scope="col">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableCouriers.map((courier) => (
                        <tr
                          key={courier.id}
                          className={
                            String(selectedCourierId) === String(courier.id)
                              ? "courier-option-selected"
                              : ""
                          }
                          onClick={(event) => {
                            if (event.target.type !== "radio") {
                              setSelectedCourierId(String(courier.id));
                            }
                          }}
                        >
                          <td>
                            <input
                              type="radio"
                              name="selectedCourier"
                              aria-label={`Select ${courier.name}`}
                              value={courier.id}
                              checked={
                                String(selectedCourierId) === String(courier.id)
                              }
                              onChange={() =>
                                setSelectedCourierId(String(courier.id))
                              }
                            />
                          </td>
                          <td className="courier-partner-name">
                            <strong>{courier.name}</strong>
                          </td>
                          <td className="courier-rate">
                            {currency(courier.rate)}
                          </td>
                          <td>{courier.etd || "—"}</td>
                          <td>{courier.rating || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="management-modal-actions">
              <button
                type="button"
                className="management-secondary"
                disabled={creatingShipment || loadingCouriers}
                onClick={() => setShipmentOrder(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="courier-create-button"
                disabled={
                  creatingShipment ||
                  loadingCouriers ||
                  !courierAvailabilityChecked ||
                  !selectedCourierId
                }
                onClick={createShipment}
              >
                {creatingShipment
                  ? "Creating shipment…"
                  : "Continue to shipment"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Orders;
