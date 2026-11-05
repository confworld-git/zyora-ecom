import "../styles/Dashboard.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import PricingSettings from "./PricingSettings";
import { useProducts } from "../../Context/ProductContext.jsx";

const Admin = () => {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();
  const availableProducts =
    productsLoading || productsError ? [] : products;
  const couponCategories = [
    ...new Set(
      availableProducts
        .map((product) => String(product.category || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
  const couponSubcategories = [
    ...new Set(
      availableProducts
        .map((product) => String(product.subcategory || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
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

    if (formData.newPassword && formData.newPassword.length < 12) {
      toast.error("New password must be at least 12 characters");
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
    applicability: "all",
    categories: [],
    subcategories: [],
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
      ...(name === "applicability"
        ? { categories: [], subcategories: [] }
        : {}),
    }));
  };

  const handleCouponCategoriesChange = (e) => {
    const categories = e.target.value ? [e.target.value] : [];
    setCouponData((prev) => ({ ...prev, categories }));
  };

  const handleCouponSubcategoriesChange = (e) => {
    const subcategories = e.target.value ? [e.target.value] : [];
    setCouponData((prev) => ({ ...prev, subcategories }));
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
      applicability,
      categories,
      subcategories,
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

    if (applicability === "categories" && categories.length === 0) {
      toast.error("Select at least one category");
      return;
    }
    if (applicability === "subcategories" && subcategories.length === 0) {
      toast.error("Select at least one subcategory");
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
          applicability,
          categories: applicability === "categories" ? categories : [],
          subcategories:
            applicability === "subcategories" ? subcategories : [],
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
          applicability: "all",
          categories: [],
          subcategories: [],
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
              minLength={12}
              placeholder="Enter new password (12 characters minimum)"
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
            <label>Applies To *</label>
            <select
              name="applicability"
              value={couponData.applicability}
              onChange={handleCouponChange}
              required
            >
              <option value="all">All products</option>
              <option value="categories">Selected categories</option>
              <option value="subcategories">Selected subcategories</option>
            </select>
          </div>
          {couponData.applicability === "categories" && (
            <div className="form-group">
              <label>Eligible Categories *</label>
              <select
                value={couponData.categories[0] || ""}
                onChange={handleCouponCategoriesChange}
                disabled={
                  productsLoading ||
                  Boolean(productsError) ||
                  couponCategories.length === 0
                }
                required
              >
                <option value="" disabled>
                  {productsLoading
                    ? "Loading categories..."
                    : productsError
                      ? "Unable to load categories."
                      : couponCategories.length === 0
                        ? "No categories found in products"
                        : "Select a category"}
                </option>
                {couponCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
          {couponData.applicability === "subcategories" && (
            <div className="form-group">
              <label>Eligible Subcategories *</label>
              <select
                value={couponData.subcategories[0] || ""}
                onChange={handleCouponSubcategoriesChange}
                disabled={
                  productsLoading ||
                  Boolean(productsError) ||
                  couponSubcategories.length === 0
                }
                required
              >
                <option value="" disabled>
                  {productsLoading
                    ? "Loading subcategories..."
                    : productsError
                      ? "Unable to load subcategories."
                      : couponSubcategories.length === 0
                        ? "No subcategories found in products"
                        : "Select a subcategory"}
                </option>
                {couponSubcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
            </div>
          )}
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

      <PricingSettings />
    </div>
  );
};

export default Admin;
