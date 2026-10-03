import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import { TiShoppingCart } from "react-icons/ti";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { useAuth } from "../../Context/AuthContext.jsx";
import { AiOutlineLogin } from "react-icons/ai";

const Navbar = () => {
  const navigate = useNavigate();
  const { customer, isLoggedIn } = useAuth();
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const totalFavorites = wishlistItems.length;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}>
      <h1>
        <Link to="/">ZYORA</Link>
      </h1>

      <ul>
        <li>
          <Link to="/About_Us">About Us</Link>
        </li>

        <li>
          <Link to="/Zyora_Category">Category</Link>
        </li>

        <li>
          <Link to="/Jewellery">Jewellery</Link>
        </li>

        <li>
          <Link to="/Contact_Us">Contact Us</Link>
        </li>

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
                <small>Welcome back</small>
                <strong>
                  {customer?.name?.trim()?.split(/\s+/)[0] || "there"}
                </strong>
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
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
