import "./navbar.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import { TiShoppingCart } from "react-icons/ti";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { useAuth } from "../../Context/AuthContext.jsx";

const Navbar = () => {
  const { customer, isLoggedIn, logout } = useAuth();
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
          {isLoggedIn ? (
            <div className="nav-user">
              <span>Hi, {customer.name.split(" ")[0]}</span>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <Link
              className="nav_icon_link"
              to="/Login"
              aria-label="Account"
              title="Account"
            >
              <i className="bi bi-person-fill"></i>
            </Link>
          )}
          {/* <Link
            className="nav_icon_link"
            to="/Login"
            aria-label="Account"
            title="Account"
          >
            <i className="bi bi-person-fill"></i>
          </Link> */}

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
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
