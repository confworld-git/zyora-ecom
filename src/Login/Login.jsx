import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import "./Login.css";
import logo from "../assets/Logo/Zyora_logo.jpg";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        toast.success("Login successful");
        navigate("/Dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zyora-login-page">
      <div className="zyora-login-container">
        <div className="zyora-login-brand">
          <div className="zyora-login-logo">
            <img src={logo} alt="" />
          </div>
          <div className="zyora-login-brand-content">
            <span>ADMIN DASHBOARD</span>
            <h1>
              Manage your
              <br />
              store with ease.
            </h1>
            <p>
              Manage products, enquiries, customers and your Zyora store from
              one place.
            </p>
          </div>
        </div>
        <div className="zyora-login-form-section">
          <div className="zyora-login-form-wrapper">
            <div className="zyora-login-heading">
              <span>WELCOME BACK</span>
              <h1>Admin Login</h1>
              <p>Sign in to access your Zyora dashboard.</p>
            </div>
            <form className="zyora-login-form" onSubmit={handleSubmit}>
              <div className="zyora-input-group">
                <label htmlFor="email">Email Address</label>
                <div className="zyora-input-wrapper">
                  <FiMail />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@zyora.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="zyora-input-group">
                <label htmlFor="password">Password</label>

                <div className="zyora-input-wrapper">
                  <FiLock />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="zyora-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="zyora-login-options">
                <label className="zyora-remember">
                  <input type="checkbox" />

                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="zyora-forgot"
                  onClick={() =>
                    toast("Contact the administrator to reset your password")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="zyora-login-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="zyora-login-security">
              <FiLock />
              Secure admin access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
