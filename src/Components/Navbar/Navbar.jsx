import "./navbar.css";
import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import {
  BsBag,
  BsBagCheckFill,
  BsHeart,
  BsHeartFill,
} from "react-icons/bs";

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
        <div className="nav_icons">
          <Link
            className="nav_icon_link"
            to="/Login"
            aria-label="Account"
            title="Account"
          >
            <i class="bi bi-person-fill"></i>
          </Link>
          <Link
            className={`nav_icon_link ${totalItems > 0 ? "has_items" : ""}`}
            to="/Cart"
            aria-label={`Shopping bag${totalItems > 0 ? `, ${totalItems} items` : ""}`}
            title="Shopping bag"
          >
            {totalItems > 0 ? <BsBagCheckFill /> : <BsBag />}
            {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
          </Link>
          <Link
            className={`nav_icon_link ${totalFavorites > 0 ? "has_items" : ""}`}
            to="/Favorites"
            aria-label={`Favorites${totalFavorites > 0 ? `, ${totalFavorites} items` : ""}`}
            title="Favorites"
          >
            {totalFavorites > 0 ? <BsHeartFill /> : <BsHeart />}
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
