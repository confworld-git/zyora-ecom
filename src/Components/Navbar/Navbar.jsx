import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import { TiShoppingCart } from "react-icons/ti";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { useAuth } from "../../Context/AuthContext.jsx";
import { AiOutlineLogin } from "react-icons/ai";
import Zyora_logo from "../../assets/Logo/Zyora_logo.jpeg";

const Navbar = () => {
  const navigate = useNavigate();
  const { customer, isLoggedIn } = useAuth();
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const totalFavorites = wishlistItems.length;

  useEffect(() => {
    const container = document.getElementById("google_translate_element");

    const setEnglishLabel = () => {
      const select = container?.querySelector("select.goog-te-combo");
      if (select && select.options[0] && select.options[0].text !== "English") {
        select.options[0].text = "English";
      }
    };

    const observer = new MutationObserver(setEnglishLabel);
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
        },
        "google_translate_element",
      );

      setEnglishLabel();
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    } else if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className={`navbar`}>
      <Link to="/">
        <img src={Zyora_logo} alt="Zyora Logo" className="zyora-logo" />
      </Link>

      <ul className="navbar-links" aria-label="Main navigation">
        <li>
          <Link to="/About_Us">About Us</Link>
        </li>

        <li>
          <Link to="/Zyora_Category">All Category</Link>
        </li>

        <li>
          <Link to="/Jewellery">Jewellery</Link>
        </li>

        <li id="policies-link">
          <Link to="/policies">Policies</Link>
        </li>

        <li id="faq-link">
          <Link to="/frequently-asked-questions">FAQs</Link>
        </li>

        <li>
          <Link to="/Contact_Us">Contact Us</Link>
        </li>
      </ul>

      <div className="nav_icons">
        <Link
          className={`nav_icon_link ${totalItems > 0 ? "has_items" : ""}`}
          to="/Cart"
          aria-label={`Shopping bag${
            totalItems > 0 ? `, ${totalItems} items` : ""
          }`}
          title="Shopping bag"
        >
          <TiShoppingCart />

          {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
        </Link>

        <Link
          className={`nav_icon_link ${totalFavorites > 0 ? "has_items" : ""}`}
          to="/Favorites"
          aria-label={`Favorites${
            totalFavorites > 0 ? `, ${totalFavorites} items` : ""
          }`}
          title="Favorites"
        >
          {totalFavorites > 0 ? <IoMdHeart /> : <IoMdHeartEmpty />}

          {totalFavorites > 0 && (
            <span className="cart_badge">{totalFavorites}</span>
          )}
        </Link>
        {isLoggedIn ? (
          <div
            className="nav-user"
            onClick={() => navigate(`/Profile/${customer.customerId}`)}
            aria-label="Account"
            title="Account"
          >
            <span className="nav-user-avatar" aria-hidden="true">
              <i className="bi bi-person-fill"></i>
            </span>
            <span className="nav-user-greeting">
              <strong>Profile</strong>
              {/* <strong>
                {customer?.name?.trim()?.split(/\s+/)[0] || "there"}
              </strong> */}
            </span>
          </div>
        ) : (
          <div className="nav-account">
            <Link
              className="nav-login-link"
              to="/Login"
              aria-label="Account"
              title="Account"
            >
              <span>Login</span>
              <AiOutlineLogin />
            </Link>
          </div>
        )}
        <div className="translate_control">
          <div id="google_translate_element"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
