import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/Logo/Zyora_logo.jpeg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
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
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/About_Us" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/Zyora_Category" className="footer-link">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/Profile" className="footer-link">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/Contact_Us" className="footer-link">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Customer Care</h4>

            <ul className="footer-links">
              <li>
                <Link
                  to="/policies?policy=shipping"
                  className="footer-link footer-policy"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies?policy=returns"
                  className="footer-link footer-policy"
                >
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/policies?policy=terms"
                  className="footer-link footer-policy"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/policies?policy=privacy"
                  className="footer-link footer-policy"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="ZYORA Logo" className="footer-logo-img" />
            </Link>
            <p className="footer-description">
              ZYORA is your one-stop online store for soft toys, home & kitchen
              products, stationery, and handbags — curated for quality, style,
              and everyday value.
            </p>
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
        </div>
        <div className="footer-bottom">
          <p>Copyright © 2026 ZYORA. All Rights Reserved.</p>

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
