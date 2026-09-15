import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/Logo/Zyora_logo.jpg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="ZYORA Logo" className="footer-logo-img" />
            </Link>
            <p className="footer-description">
              ZYORA is your one-stop online store for soft toys, home & kitchen
              products, stationery, and handbags — curated for quality, style,
              and everyday value.
            </p>
            <p className="footer-location">📍Tamil nadu, India</p>
          </div>
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-link">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/orders" className="footer-link">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Customer Care</h4>

            <ul className="footer-links">
              <li>
                <span className="footer-policy">Shipping Policy</span>
              </li>
              <li>
                <span className="footer-policy">
                  Return & Refund Policy (7 Days)
                </span>
              </li>
              <li>
                <span className="footer-policy">Terms & Conditions</span>
              </li>
              <li>
                <span className="footer-policy">Privacy Policy</span>
              </li>
            </ul>

            <h5 className="footer-connect-heading">Connect With Us</h5>

            <div className="footer-socials">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="instagram"
                title="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="facebook"
                title="Facebook"
              >
                <i className="bi bi-facebook"></i>
              </a>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="whatsapp"
                title="WhatsApp"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-heading">Newsletter</h4>

            <p className="footer-newsletter-text">
              Get updates on new arrivals and exclusive deals.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="newsletter-form"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />

              <button type="submit" className="newsletter-button">
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 ZYORA. All Rights Reserved.</p>

          <div className="footer-badges">
            <span className="footer-badge">Razorpay Verified</span>
            <span className="footer-badge">Cash on Delivery</span>
            <span className="footer-badge">100% Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
