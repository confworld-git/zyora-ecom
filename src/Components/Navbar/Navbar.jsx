import "./navbar.css";
import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import { MdPerson } from "react-icons/md";

const Navbar = () => {
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const totalFavorites = wishlistItems.length;

  return (
    <nav className="navbar">
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
          <Link to="/Contact_Us">Contact Us</Link>
        </li>
        <li>
          <Link to="/Login">
            <MdPerson />
          </Link>
        </li>
        <Link
          className={`cart_icon ${totalItems > 0 ? "has_items" : ""}`}
          to="/Cart"
        >
          {totalItems > 0 ? (
            <i className="bi bi-bag-check-fill"></i>
          ) : (
            <i className="bi bi-bag-check"></i>
          )}
          {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
        </Link>
        <Link
          className={`cart_icon ${totalFavorites > 0 ? "has_items" : ""}`}
          to="/Favorites"
        >
          {totalFavorites > 0 ? (
            <i className="bi bi-heart-fill"></i>
          ) : (
            <i className="bi bi-heart"></i>
          )}

          {totalFavorites > 0 && (
            <span className="cart_badge">{totalFavorites}</span>
          )}
        </Link>
      </ul>
    </nav>
  );
};

export default Navbar;
