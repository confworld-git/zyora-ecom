import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CanvasParticles from "canvasparticles-js";
import { useAuth } from "../Context/AuthContext.jsx";
import "./Login.css";

const PARTICLE_COLOR = "#ffffff";
const API = import.meta.env.VITE_API_BASE_URL;

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // page the visitor wanted before being sent to login (set by CustomerRoute)
  const redirectTo = location.state?.from?.pathname || "/";
  const particlesRef = useRef(null);
  const { isLoggedIn, loading: authLoading, refresh } = useAuth();

  // "login" | "register"
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const particles = new CanvasParticles(canvas, {
      mouse: {
        interactionType: 2,
        connectDistMult: 0.8,
        distRatio: 0.8,
      },
      particles: {
        color: PARTICLE_COLOR,
        ppm: 120,
        connectDistance: 140,
      },
    });

    particles.setParticleColor?.(PARTICLE_COLOR);
    particles.start();

    return () => particles.destroy();
  }, []);

  // Show errors sent back by the Google OAuth redirect (/login?error=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return;

    const messages = {
      google_cancelled: "Google sign-in was cancelled",
      invalid_state: "Sign-in session expired. Please try again",
      email_not_verified: "Your Google email isn't verified",
      google_failed: "Google sign-in failed. Please try again",
    };

    toast.error(messages[err] || "Unable to sign in");
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const switchMode = (next) => {
    setMode(next);
    setShowPassword(false);

    setFormData((prev) => ({
      ...emptyForm,
      email: prev.email,
    }));
  };

  const handleLogin = async () => {
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    if (!payload.email || !payload.password) {
      toast.error("Enter your email and password");
      return;
    }

    try {
      setLoading(true);

      try {
        const adminResponse = await axios.post(
          `${API}/api/auth/login`,
          payload,
          {
            withCredentials: true,
          },
        );

        if (adminResponse.data.success) {
          toast.success("Admin signed in");
          navigate("/Dashboard", { replace: true });
          return;
        }
      } catch (adminError) {
        if (adminError.response?.status !== 401) {
          throw adminError;
        }
      }

      const response = await axios.post(
        `${API}/api/auth/customer-login`,
        payload,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        const me = await refresh(); // updates global auth state and returns the customer
        const firstName = me?.name?.split(" ")[0];

        toast.success(
          firstName ? `Welcome to ZYORA, ${firstName}!` : "Welcome to ZYORA!",
        );
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      termsAccepted: formData.termsAccepted,
    };

    if (!payload.name) {
      toast.error("Enter your full name");
      return;
    }

    if (!payload.email) {
      toast.error("Enter your email address");
      return;
    }

    if (!payload.mobile) {
      toast.error("Enter your mobile number");
      return;
    }

    // Basic Indian mobile validation
    if (!/^[6-9]\d{9}$/.test(payload.mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    if (!payload.password) {
      toast.error("Enter a password");
      return;
    }

    if (payload.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (payload.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!payload.termsAccepted) {
      toast.error("Please accept the Terms & Conditions");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API}/api/auth/register`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Account created. Sign in to continue.");

        switchMode("login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    return isLogin ? handleLogin() : handleRegister();
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/api/auth/google`;
  };

  const passwordToggle = (
    <button
      type="button"
      className="zyora-password-toggle"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
    >
      {showPassword ? <FiEyeOff /> : <FiEye />}
    </button>
  );

  // Already signed-in customers don't need the login page
  // (must stay below all hooks)
  if (!authLoading && isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <main className="zyora-login-page">
      <div className="zyora-login-container">
        {/* LEFT BRAND SECTION */}
        <section className="zyora-login-brand" aria-label="ZYORA">
          <div
            ref={particlesRef}
            className="zyora-login-particles"
            aria-hidden="true"
          />

          <div className="zyora-login-brand-content">
            <span className="zyora-login-brand-mark" aria-hidden="true">
              ✳
            </span>

            <h2>HELLO ZYORA!</h2>

            <p>
              Thoughtfully curated finds, managed in one place. Sign in to keep
              your store running smoothly.
            </p>
          </div>

          <p className="zyora-login-footer">© ZYORA. All rights reserved.</p>
        </section>

        {/* FORM SECTION */}
        <section className="zyora-login-form-section">
          <div className="zyora-login-form-wrapper">
            <div className="zyora-login-heading">
              {isLogin ? (
                <>
                  <h1>Welcome back</h1>

                  <p>
                    Sign in to your ZYORA account to continue shopping and
                    manage your orders. Don’t have an account? <br />
                    <button
                      type="button"
                      className="zyora-link"
                      onClick={() => switchMode("register")}
                    >
                      Create a new account
                    </button>
                    — it’s quick, easy, and free!
                  </p>
                </>
              ) : (
                <>
                  <h1>Create your account</h1>

                  <p>
                    Join ZYORA to shop curated finds and track your orders.
                    <br />
                    <button
                      type="button"
                      className="zyora-link"
                      onClick={() => switchMode("login")}
                    >
                      Already have an account?
                    </button>
                  </p>
                </>
              )}
            </div>

            <form
              key={mode}
              className="zyora-login-form"
              onSubmit={handleSubmit}
            >
              {/* NAME */}
              {!isLogin && (
                <div className="zyora-input-group">
                  <label htmlFor="name">Full name</label>

                  <div className="zyora-input-wrapper">
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div className="zyora-input-group">
                <label htmlFor="email">Email address</label>

                <div className="zyora-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* MOBILE */}
              {!isLogin && (
                <div className="zyora-input-group">
                  <label htmlFor="mobile">Mobile number</label>

                  <div className="zyora-input-wrapper">
                    <input
                      id="mobile"
                      type="tel"
                      name="mobile"
                      placeholder="10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div className="zyora-input-group">
                <label htmlFor="password">Password</label>

                <div className="zyora-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={
                      isLogin ? "Enter your password" : "At least 8 characters"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                  />

                  {passwordToggle}
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              {!isLogin && (
                <div className="zyora-input-group">
                  <label htmlFor="confirmPassword">Confirm password</label>

                  <div className="zyora-input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* TERMS */}
              {!isLogin && (
                <div className="zyora-terms">
                  <label className="zyora-checkbox-label">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      required
                    />

                    <span>
                      I agree to ZYORA's{" "}
                      <button
                        type="button"
                        className="zyora-link"
                        onClick={() => navigate("/terms-and-conditions")}
                      >
                        Terms & Conditions
                      </button>{" "}
                      and Privacy Policy.
                    </span>
                  </label>
                </div>
              )}

              {/* FORGOT PASSWORD */}
              {isLogin && (
                <div className="zyora-login-options">
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
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                className="zyora-login-button"
                disabled={loading}
              >
                {loading
                  ? isLogin
                    ? "Signing in…"
                    : "Creating account…"
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
              <div className="zyora-login-divider">
                <span>OR</span>
              </div>
              <button
                type="button"
                className="zyora-google-button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/48/google-logo.png"
                  alt="Google"
                  className="zyora-google-icon"
                />
                Continue with Google
              </button>
              <p style={{ fontSize: "12px", opacity: 0.7, textAlign: "center" }}>
                By continuing with Google you agree to our Terms & Conditions
                and Privacy Policy.
              </p>
            </form>

            <div className="zyora-login-security">
              <FiLock aria-hidden="true" />

              <span>Securely Access Your Account</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
