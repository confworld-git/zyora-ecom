import "./Dashboard.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Admin = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (!formData.newEmail && !formData.newPassword) {
      toast.error("Enter a new email or password");
      return;
    }

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/credentials`,
        {
          currentPassword: formData.currentPassword,
          newEmail: formData.newEmail || undefined,
          newPassword: formData.newPassword || undefined,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setFormData({
          currentPassword: "",
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update admin credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  const [couponData, setCouponData] = useState({
    code: "",
    discountType: "",
    discountValue: "",
    minimumOrderValue: "",
    maximumDiscount: "",
    expiryDate: "",
    usageLimit: "",
    status: "active",
  });

  const [couponLoading, setCouponLoading] = useState(false);

  const handleCouponChange = (e) => {
    const { name, value } = e.target;

    setCouponData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();

    const {
      code,
      discountType,
      discountValue,
      minimumOrderValue,
      maximumDiscount,
      expiryDate,
      usageLimit,
      status,
    } = couponData;

    if (!code.trim()) {
      toast.error("Enter a coupon code");
      return;
    }

    if (!discountType) {
      toast.error("Select a discount type");
      return;
    }

    if (!discountValue || Number(discountValue) <= 0) {
      toast.error("Enter a valid discount value");
      return;
    }

    if (discountType === "percentage" && Number(discountValue) > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    if (minimumOrderValue === "" || Number(minimumOrderValue) < 0) {
      toast.error("Enter a valid minimum order value");
      return;
    }

    if (
      discountType === "percentage" &&
      (maximumDiscount === "" || Number(maximumDiscount) <= 0)
    ) {
      toast.error("Enter the maximum discount amount");
      return;
    }

    if (!expiryDate) {
      toast.error("Select a coupon expiry date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${expiryDate}T00:00:00`);

    if (selectedDate < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    if (!usageLimit || Number(usageLimit) <= 0) {
      toast.error("Enter a valid usage limit");
      return;
    }

    if (!status) {
      toast.error("Select coupon status");
      return;
    }

    try {
      setCouponLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/coupons`,
        {
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minimumOrderValue: Number(minimumOrderValue),
          maximumDiscount:
            discountType === "percentage" ? Number(maximumDiscount) : null,
          expiryDate,
          usageLimit: Number(usageLimit),
          status,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success(response.data.message || "Coupon created successfully");
        setCouponData({
          code: "",
          discountType: "",
          discountValue: "",
          minimumOrderValue: "",
          maximumDiscount: "",
          expiryDate: "",
          usageLimit: "",
          status: "active",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="admin_panel">
      <div className="page-header">
        <div>
          <span className="page-label">ADMIN MANAGEMENT</span>
          <h1>Admin Panel</h1>
          <p>Manage your admin login credentials.</p>
        </div>
      </div>
      <div className="admin-settings-card">
        <div className="admin-settings-header">
          <h2>Change Login Credentials</h2>

          <p>
            Update the email address or password used to access the admin
            dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Email</label>

            <input
              type="email"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleChange}
              placeholder="Enter new email"
            />
          </div>

          <div className="form-group">
            <label>Current Password</label>

            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="update-admin-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </div>

      <div className="admin-settings-card">
        <div className="admin-settings-header">
          <h2>Create Coupon Code</h2>

          <p>
            Create discount coupons with custom offers, validity dates, and
            usage limits.
          </p>
        </div>

        <form onSubmit={handleCouponSubmit}>
          <div className="form-group">
            <label>Coupon Code *</label>

            <input
              type="text"
              name="code"
              value={couponData.code}
              onChange={handleCouponChange}
              placeholder="e.g. ZYR50"
              maxLength={30}
              required
            />
          </div>
          <div className="form-group">
            <label>Discount Type *</label>

            <select
              name="discountType"
              value={couponData.discountType}
              onChange={handleCouponChange}
              required
            >
              <option value="">Select discount type</option>

              <option value="percentage">Percentage (%)</option>

              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              {couponData.discountType === "fixed"
                ? "Discount Amount *"
                : "Discount Percentage *"}
            </label>

            <input
              type="number"
              name="discountValue"
              value={couponData.discountValue}
              onChange={handleCouponChange}
              placeholder={
                couponData.discountType === "fixed" ? "e.g. 100" : "e.g. 20"
              }
              min="1"
              max={couponData.discountType === "percentage" ? "100" : undefined}
              required
            />
          </div>

          <div className="form-group">
            <label>Minimum Order Value *</label>

            <input
              type="number"
              name="minimumOrderValue"
              value={couponData.minimumOrderValue}
              onChange={handleCouponChange}
              placeholder="e.g. 999"
              min="0"
              required
            />
          </div>
          {couponData.discountType === "percentage" && (
            <div className="form-group">
              <label>Maximum Discount Amount *</label>

              <input
                type="number"
                name="maximumDiscount"
                value={couponData.maximumDiscount}
                onChange={handleCouponChange}
                placeholder="e.g. 500"
                min="1"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Coupon Expiry Date *</label>

            <input
              type="date"
              name="expiryDate"
              value={couponData.expiryDate}
              onChange={handleCouponChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Usage Limit *</label>

            <input
              type="number"
              name="usageLimit"
              value={couponData.usageLimit}
              onChange={handleCouponChange}
              placeholder="e.g. 100"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Coupon Status *</label>

            <select
              name="status"
              value={couponData.status}
              onChange={handleCouponChange}
              required
            >
              <option value="active">Active</option>

              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="update-admin-btn"
            disabled={couponLoading}
          >
            {couponLoading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
