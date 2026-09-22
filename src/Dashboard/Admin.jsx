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
    </div>
  );
};

export default Admin;
