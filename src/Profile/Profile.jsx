import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  Navigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiLogOut,
  FiHeart,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { TiHomeOutline } from "react-icons/ti";
import { BsCart4 } from "react-icons/bs";
import { useAuth } from "../Context/AuthContext.jsx";
import "./Profile.css";
import SEO from "../SEO.jsx";

const API = import.meta.env.VITE_API_BASE_URL;

const TABS = [
  { id: "account", label: "Account", icon: FiUser },
  { id: "orders", label: "Orders", icon: FiPackage },
  { id: "addresses", label: "Addresses", icon: FiMapPin },
];

const STATUS_LABELS = {
  placed: "Order placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

// ---------- Saved addresses (same storage keys the cart uses) ----------
const getStoredAddresses = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("addresses") || "null");
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch (error) {
    console.error("Unable to parse saved addresses", error);
  }

  try {
    const def = JSON.parse(localStorage.getItem("defaultAddress") || "null");
    return def ? [def] : [];
  } catch (error) {
    console.error("Unable to parse default address", error);
    return [];
  }
};

const persistAddresses = (list) => {
  try {
    const def = list.find((a) => a.isDefault);
    if (def) localStorage.setItem("defaultAddress", JSON.stringify(def));
    else localStorage.removeItem("defaultAddress");
    localStorage.setItem("addresses", JSON.stringify(list));
  } catch (error) {
    console.error("Unable to save addresses", error);
  }
};

const emptyAddress = {
  name: "",
  mobile: "",
  houseNumber: "",
  address: "",
  locality: "",
  city: "",
  state: "",
  pinCode: "",
  isDefault: false,
};

// ============================================================
// ACCOUNT TAB
// ============================================================
const AccountTab = ({ customer, refresh }) => {
  const [name, setName] = useState(customer.name || "");
  const [mobile, setMobile] = useState(customer.mobile || "");
  const [saving, setSaving] = useState(false);

  const changed =
    name.trim() !== (customer.name || "") ||
    mobile.trim() !== (customer.mobile || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !changed) return;

    const payload = {};
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();

    if (cleanName !== (customer.name || "")) {
      if (cleanName.length < 2) {
        toast.error("Name must be at least 2 characters");
        return;
      }
      payload.name = cleanName;
    }

    if (cleanMobile !== (customer.mobile || "")) {
      if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
        toast.error("Enter a valid 10-digit mobile number");
        return;
      }
      payload.mobile = cleanMobile;
    }

    try {
      setSaving(true);

      await axios.put(`${API}/api/customer/profile`, payload, {
        withCredentials: true,
      });

      await refresh(); // update the name everywhere (navbar, header)
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="zyora-profile-panel">
      <h2>Account details</h2>
      <p className="zyora-profile-sub">
        Keep your details up to date for faster delivery updates.
      </p>

      <form className="zyora-profile-form" onSubmit={handleSubmit}>
        <div className="zyora-profile-field">
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="zyora-profile-field">
          <label htmlFor="profile-email">Email address</label>
          <input
            id="profile-email"
            type="email"
            value={customer.email}
            disabled
          />
          <small>Email can't be changed because it is your sign-in ID.</small>
        </div>

        <div className="zyora-profile-field">
          <label htmlFor="profile-mobile">Mobile number</label>
          <input
            id="profile-mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            autoComplete="tel"
          />
        </div>

        <div className="zyora-profile-field">
          <label>Customer ID</label>
          <input type="text" value={customer.customerId} disabled />
        </div>

        <button
          type="submit"
          className="zyora-profile-btn"
          disabled={!changed || saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
};

// ============================================================
// ORDERS TAB
// ============================================================
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(`${API}/api/orders`, {
          withCredentials: true,
        });

        if (!cancelled) setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Get orders error:", err);
        if (!cancelled) setError("Unable to load your orders right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="zyora-profile-panel">
        <h2>My orders</h2>
        <p className="zyora-profile-muted">Loading your orders…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="zyora-profile-panel">
        <h2>My orders</h2>
        <p className="zyora-profile-error">{error}</p>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="zyora-profile-panel zyora-profile-empty">
        <FiPackage aria-hidden="true" />
        <h2>No orders yet</h2>
        <p>When you place an order, it will show up here.</p>
        <Link to="/Zyora_Category" className="zyora-profile-btn">
          Start shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="zyora-profile-panel">
      <h2>My orders</h2>
      <p className="zyora-profile-sub">
        {orders.length} {orders.length === 1 ? "order" : "orders"} placed
      </p>

      <div className="zyora-order-list">
        {orders.map((order) => (
          <article className="zyora-order-card" key={order._id}>
            <header className="zyora-order-head">
              <div>
                <strong>#{order.orderId}</strong>
                <span>{formatDate(order.createdAt)}</span>
              </div>

              <span
                className={`zyora-order-status status-${order.orderStatus}`}
              >
                {STATUS_LABELS[order.orderStatus] || order.orderStatus}
              </span>
            </header>

            <ul className="zyora-order-items">
              {order.items?.map((item, index) => (
                <li key={`${item.productId || item.name}-${index}`}>
                  {item.image && (
                    <img src={item.image} alt={item.name} loading="lazy" />
                  )}

                  <div>
                    <p>{item.name}</p>
                    <small>
                      {[
                        item.size && `Size: ${item.size}`,
                        item.color && `Color: ${item.color}`,
                        `Qty: ${item.quantity}`,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </small>
                  </div>

                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <footer className="zyora-order-foot">
              <span>
                Payment:{" "}
                {order.paymentMethod === "cod" ? "Cash on delivery" : "Online"}{" "}
                ({order.paymentStatus})
              </span>

              <strong>Total {formatPrice(order.total)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// ADDRESSES TAB
// ============================================================
const AddressesTab = () => {
  const [addresses, setAddresses] = useState(getStoredAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);

  const save = (next) => {
    setAddresses(next);
    persistAddresses(next);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = (e) => {
    e.preventDefault();

    const entry = {
      ...form,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      houseNumber: form.houseNumber.trim(),
      address: form.address.trim(),
      locality: form.locality.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: form.pinCode.trim(),
    };

    if (!entry.name || !entry.address || !entry.city || !entry.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(entry.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (!/^\d{6}$/.test(entry.pinCode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }

    const makeDefault = entry.isDefault || addresses.length === 0;

    const base = makeDefault
      ? addresses.map((a) => ({ ...a, isDefault: false }))
      : addresses;

    save([...base, { ...entry, isDefault: makeDefault }]);
    setForm(emptyAddress);
    setShowForm(false);
    toast.success("Address saved");
  };

  const setDefault = (index) => {
    save(addresses.map((a, i) => ({ ...a, isDefault: i === index })));
  };

  const remove = (index) => {
    const next = addresses.filter((_, i) => i !== index);

    // keep one default address when any remain
    if (next.length > 0 && !next.some((a) => a.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }

    save(next);
  };

  return (
    <section className="zyora-profile-panel">
      <div className="zyora-profile-panel-head">
        <div>
          <h2>Saved addresses</h2>
          <p className="zyora-profile-sub">
            Choose where we deliver your orders.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className="zyora-profile-btn outline"
            onClick={() => setShowForm(true)}
          >
            <FiPlus aria-hidden="true" /> Add address
          </button>
        )}
      </div>

      {showForm && (
        <form className="zyora-profile-form address-form" onSubmit={handleAdd}>
          <div className="zyora-profile-field">
            <label htmlFor="addr-name">Full name *</label>
            <input
              id="addr-name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-mobile">Mobile number *</label>
            <input
              id="addr-mobile"
              name="mobile"
              inputMode="numeric"
              maxLength={10}
              value={form.mobile}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-house">House / Flat no.</label>
            <input
              id="addr-house"
              name="houseNumber"
              value={form.houseNumber}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-pin">Pincode *</label>
            <input
              id="addr-pin"
              name="pinCode"
              inputMode="numeric"
              maxLength={6}
              value={form.pinCode}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field full">
            <label htmlFor="addr-address">Address (street, area) *</label>
            <input
              id="addr-address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-locality">Locality / Landmark</label>
            <input
              id="addr-locality"
              name="locality"
              value={form.locality}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-city">City *</label>
            <input
              id="addr-city"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
          </div>

          <div className="zyora-profile-field">
            <label htmlFor="addr-state">State *</label>
            <input
              id="addr-state"
              name="state"
              value={form.state}
              onChange={handleChange}
            />
          </div>

          <label className="zyora-profile-check full">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleChange}
            />
            Make this my default address
          </label>

          <div className="zyora-profile-actions full">
            <button type="submit" className="zyora-profile-btn">
              Save address
            </button>

            <button
              type="button"
              className="zyora-profile-btn outline"
              onClick={() => {
                setForm(emptyAddress);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="zyora-profile-empty small">
          <FiMapPin aria-hidden="true" />
          <p>You haven't saved any address yet.</p>
        </div>
      ) : (
        <div className="zyora-address-grid">
          {addresses.map((a, index) => (
            <article
              className={`zyora-address-card${a.isDefault ? " is-default" : ""}`}
              key={`${a.mobile}-${index}`}
            >
              {a.isDefault && (
                <span className="zyora-address-badge">Default</span>
              )}

              <strong>{a.name}</strong>

              <p>
                {[a.houseNumber, a.address, a.locality]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                {a.city}, {a.state} - {a.pinCode}
              </p>
              <p className="zyora-profile-muted">Mobile: {a.mobile}</p>

              <div className="zyora-address-actions">
                {!a.isDefault && (
                  <button type="button" onClick={() => setDefault(index)}>
                    Set as default
                  </button>
                )}

                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(index)}
                  aria-label={`Delete address for ${a.name}`}
                >
                  <FiTrash2 aria-hidden="true" /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================================
// PROFILE PAGE
// ============================================================
const Profile = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { customer, refresh, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const [avatarFailed, setAvatarFailed] = useState(false);

  const requested = params.get("tab");
  const tab = TABS.some((t) => t.id === requested) ? requested : "account";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  if (!customer) return null; // CustomerRoute already guards this page
  if (customerId !== customer.customerId) {
    return <Navigate to={`/Profile/${customer.customerId}`} replace />;
  }

  const initials = (customer.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <>
      <SEO title="My Account | ZYORA" noindex />
      <main className="zyora-profile-page">
        <div className="zyora-profile-wrap">
          {/* Header card */}
          <header className="zyora-profile-header">
            <div className="zyora-profile-avatar">
              {customer.profileImage && !avatarFailed ? (
                <img
                  src={customer.profileImage}
                  alt={customer.name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="zyora-profile-who">
              <h1>{customer.name}</h1>
              <p>{customer.email}</p>
            </div>

            <div className="zyora-profile-header-actions">
              <Link to="/" className="zyora-profile-btn outline">
                <TiHomeOutline aria-hidden="true" /> Home
              </Link>

              <Link to="/Cart" className="zyora-profile-btn outline">
                <BsCart4 aria-hidden="true" /> Cart
              </Link>

              <Link to="/Favorites" className="zyora-profile-btn outline">
                <FiHeart aria-hidden="true" /> Favorites
              </Link>

              <button
                type="button"
                className="zyora-profile-btn outline danger"
                onClick={handleLogout}
              >
                <FiLogOut aria-hidden="true" /> Logout
              </button>
            </div>
          </header>

          <div className="zyora-profile-layout">
            {/* Tabs */}
            <nav className="zyora-profile-tabs" aria-label="Profile sections">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={tab === id ? "active" : ""}
                  onClick={() => setParams({ tab: id }, { replace: true })}
                  aria-current={tab === id ? "page" : undefined}
                >
                  <Icon aria-hidden="true" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="zyora-profile-content">
              {tab === "account" && (
                <AccountTab customer={customer} refresh={refresh} />
              )}
              {tab === "orders" && <OrdersTab />}
              {tab === "addresses" && <AddressesTab />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
