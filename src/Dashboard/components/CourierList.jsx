import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/admin/couriers`;
const config = { withCredentials: true };

const callBeforeDelivery = (value) => {
  if (value === true || value === 1 || value === "1") {
    return { label: "Yes", className: "courier-feature-yes" };
  }
  if (value === false || value === 0 || value === "0") {
    return { label: "No", className: "courier-feature-no" };
  }

  const label = String(value ?? "").trim();
  const normalized = label.toLowerCase();
  if (["yes", "available", "supported"].includes(normalized)) {
    return { label, className: "courier-feature-yes" };
  }
  if (["no", "unavailable", "not supported"].includes(normalized)) {
    return { label, className: "courier-feature-no" };
  }
  return { label: label || "—", className: "courier-feature-unknown" };
};

const CourierList = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCouriers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API, config);
      const list = response.data.couriers;
      if (!Array.isArray(list)) {
        throw new Error("Courier list response was invalid");
      }
      setCouriers(list);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Unable to fetch courier list.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  const visibleCouriers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return couriers.filter(
      (courier) =>
        !query ||
        [courier.name, courier.company, courier.id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [couriers, search]);

  const companyCount = useMemo(
    () => new Set(couriers.map((c) => c.company).filter(Boolean)).size,
    [couriers],
  );
  const realTimeCount = useMemo(
    () => couriers.filter((c) => c.tracking === "Real Time").length,
    [couriers],
  );

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">DELIVERY MANAGEMENT</span>
          <h1>Courier list</h1>
          <p>Review available courier partners and their service features.</p>
        </div>
        <button
          className="management-refresh"
          onClick={fetchCouriers}
          type="button"
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      <section className="management-stats" aria-label="Courier summary">
        <article>
          <span>Total couriers</span>
          <strong>{couriers.length}</strong>
        </article>
        <article>
          <span>Companies</span>
          <strong>{companyCount}</strong>
        </article>
        <article>
          <span>Real-time tracking</span>
          <strong>{realTimeCount}</strong>
        </article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search couriers"
          placeholder="Search courier name, company or ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="management-empty">Loading couriers…</p>
      ) : visibleCouriers.length === 0 ? (
        <p className="management-empty">
          {couriers.length
            ? "No couriers match your search."
            : "No couriers are currently available."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>Courier</th>
                <th>Courier ID</th>
                <th>Company</th>
                <th>Tracking</th>
                <th>POD</th>
                <th>Call before delivery</th>
              </tr>
            </thead>
            <tbody>
              {visibleCouriers.map((courier) => {
                const callBefore = callBeforeDelivery(courier.callBefore);
                return (
                  <tr key={courier.id}>
                    <td>
                      <strong>{courier.name || "Courier"}</strong>
                    </td>
                    <td>{courier.id}</td>
                    <td>{courier.company || "—"}</td>
                    <td>{courier.tracking || "—"}</td>
                    <td>{courier.pod || "—"}</td>
                    <td>
                      <span
                        className={`courier-feature-badge ${callBefore.className}`}
                      >
                        {callBefore.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default CourierList;