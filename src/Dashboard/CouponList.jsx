import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "./CouponList.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/coupons`;
const cfg = { withCredentials: true };

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const toInputDate = (d) => new Date(d).toISOString().split("T")[0];

// Derive the state an admin actually cares about
const getState = (c) => {
  if (new Date(c.expiryDate) < new Date()) return "expired";
  if (c.usedCount >= c.usageLimit) return "used-up";
  return c.status === "active" ? "active" : "inactive";
};

const STATE_LABEL = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
  "used-up": "Used up",
};

const CouponList = ({ refreshKey = 0 }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null); // coupon being edited
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, cfg);
      const list = res.data.coupons || res.data.data || res.data;
      setCoupons(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons, refreshKey]);

  const visible = useMemo(
    () =>
      coupons.filter((c) => {
        const matchesSearch = c.code
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        const matchesFilter = filter === "all" || getState(c) === filter;
        return matchesSearch && matchesFilter;
      }),
    [coupons, search, filter],
  );

  const replaceCoupon = (updated) =>
    setCoupons((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

  const toggleStatus = async (coupon) => {
    const next = coupon.status === "active" ? "inactive" : "active";
    try {
      const res = await axios.patch(
        `${API}/${coupon._id}/status`,
        { status: next },
        cfg,
      );
      replaceCoupon(res.data.coupon);
      toast.success(`${coupon.code} is now ${next}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}? This can't be undone.`))
      return;
    try {
      await axios.delete(`${API}/${coupon._id}`, cfg);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      toast.success(`${coupon.code} deleted`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const openEdit = (c) =>
    setEditing({
      _id: c._id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumOrderValue: c.minimumOrderValue,
      maximumDiscount: c.maximumDiscount ?? "",
      expiryDate: toInputDate(c.expiryDate),
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
    });

  const handleEditChange = (e) =>
    setEditing((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEdit = async (e) => {
    e.preventDefault();
    const d = editing;

    if (!d.discountValue || Number(d.discountValue) <= 0)
      return toast.error("Enter a valid discount value");
    if (d.discountType === "percentage" && Number(d.discountValue) > 100)
      return toast.error("Percentage discount cannot exceed 100%");
    if (d.minimumOrderValue === "" || Number(d.minimumOrderValue) < 0)
      return toast.error("Enter a valid minimum order value");
    if (
      d.discountType === "percentage" &&
      (d.maximumDiscount === "" || Number(d.maximumDiscount) <= 0)
    )
      return toast.error("Enter the maximum discount amount");
    if (!d.expiryDate) return toast.error("Select an expiry date");
    if (!d.usageLimit || Number(d.usageLimit) < d.usedCount)
      return toast.error(
        `Usage limit can't be below the ${d.usedCount} already used`,
      );

    try {
      setSaving(true);
      const res = await axios.put(
        `${API}/${d._id}`,
        {
          discountValue: Number(d.discountValue),
          minimumOrderValue: Number(d.minimumOrderValue),
          maximumDiscount:
            d.discountType === "percentage" ? Number(d.maximumDiscount) : null,
          expiryDate: d.expiryDate,
          usageLimit: Number(d.usageLimit),
        },
        cfg,
      );
      replaceCoupon(res.data.coupon);
      toast.success(`${d.code} updated`);
      setEditing(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`${code} copied`);
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  return (
    <div className="admin-settings-card">
      <div className="admin-settings-header">
        <h2>All Coupons ({coupons.length})</h2>
        <p>Edit, pause, or delete the coupons customers can use at checkout.</p>
      </div>

      <div className="coupon-toolbar">
        <input
          type="text"
          placeholder="Search by code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All coupons</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="used-up">Used up</option>
        </select>
      </div>

      {loading ? (
        <p className="coupon-empty">Loading coupons...</p>
      ) : visible.length === 0 ? (
        <p className="coupon-empty">
          {coupons.length === 0
            ? "No coupons yet. Create your first one above."
            : "No coupons match your search."}
        </p>
      ) : (
        <div className="coupon-table-wrap">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. order</th>
                <th>Used</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const state = getState(c);
                const locked = state === "expired" || state === "used-up";
                return (
                  <tr key={c._id}>
                    <td>
                      <button
                        type="button"
                        className="coupon-code"
                        onClick={() => copyCode(c.code)}
                        title="Copy code"
                      >
                        {c.code}
                      </button>
                    </td>
                    <td>
                      {c.discountType === "percentage"
                        ? `${c.discountValue}% (up to ₹${c.maximumDiscount})`
                        : `₹${c.discountValue} off`}
                    </td>
                    <td>₹{c.minimumOrderValue}</td>
                    <td>
                      {c.usedCount} / {c.usageLimit}
                    </td>
                    <td>{formatDate(c.expiryDate)}</td>
                    <td>
                      <span className={`coupon-badge ${state}`}>
                        {STATE_LABEL[state]}
                      </span>
                    </td>
                    <td>
                      <div className="coupon-actions">
                        <button type="button" onClick={() => openEdit(c)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(c)}
                          disabled={locked}
                        >
                          {c.status === "active" ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => deleteCoupon(c)}
                        >
                          Delete
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
        <div className="coupon-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit {editing.code}</h2>
            <p className="field-hint">
              The code and discount type can't be changed. Delete the coupon
              and create a new one instead.
            </p>

            <form onSubmit={saveEdit}>
              <div className="form-group">
                <label>
                  {editing.discountType === "fixed"
                    ? "Discount Amount (₹)"
                    : "Discount Percentage (%)"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={editing.discountValue}
                  onChange={handleEditChange}
                  min="1"
                  max={editing.discountType === "percentage" ? "100" : undefined}
                />
              </div>

              <div className="form-group">
                <label>Minimum Order Value</label>
                <input
                  type="number"
                  name="minimumOrderValue"
                  value={editing.minimumOrderValue}
                  onChange={handleEditChange}
                  min="0"
                />
              </div>

              {editing.discountType === "percentage" && (
                <div className="form-group">
                  <label>Maximum Discount Amount</label>
                  <input
                    type="number"
                    name="maximumDiscount"
                    value={editing.maximumDiscount}
                    onChange={handleEditChange}
                    min="1"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={editing.expiryDate}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Usage Limit (already used: {editing.usedCount})</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={editing.usageLimit}
                  onChange={handleEditChange}
                  min={editing.usedCount || 1}
                />
              </div>

              <div className="coupon-modal-actions">
                <button
                  type="button"
                  className="coupon-cancel"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="update-admin-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
