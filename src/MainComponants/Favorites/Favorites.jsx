import "./Favorites.css";
import { useState } from "react";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext.jsx";
import breakHeart from "../../assets/Videos/break.gif";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import toast from "react-hot-toast";

const Favorites = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const navigate = useNavigate();

  const openProduct = (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      console.error("Product ID missing:", product);
      return;
    }

    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();
    addToCart(product);
    toast.success("Added to cart");
  };

  return (
    <div className="favourites">
      <div id="page_path">
        <p>
          Home <MdKeyboardArrowRight /> Favourites
        </p>
      </div>
      {wishlistItems.length > 0 && (
        <>
          <h1>
            Favorite <span>Items</span>
          </h1>
          <p>Because your cart can’t hold all your crushes.</p>
        </>
      )}
      {wishlistItems.length === 0 ? (
        <div className="empty_favourites">
          <img src={breakHeart} alt="" />
          <h2>No favorite items yet</h2>
          <p>
            Start adding products to your favorites and they will appear here.
          </p>
        </div>
      ) : (
        <section className="favourite_products">
          {wishlistItems.map((product) => {
            const productId = product.id || product._id;
            return (
              <div
                className="favourite_product"
                key={productId}
                onClick={() => openProduct(product)}
                onMouseEnter={() => setHoveredProductId(productId)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeFromWishlist(productId);
                  }}
                  title="Remove from favorites"
                >
                  <i className="bi bi-heart-fill"></i>
                </button>
                <img src={product.image} alt={product.name || "Product"} />
                <h1>{product.name}</h1>
                <p className="fav_title">
                  {product.title || "Beautiful product from Zyora."}{" "}
                </p>
                <p className="favourite_price">
                  <i className="bi bi-currency-rupee"></i>
                  {product.price?.toLocaleString("en-IN")}
                </p>
                {product.mrp > product.price && (
                  <div className="favourite_price_details">
                    <del> ₹{product.mrp?.toLocaleString("en-IN")} </del>
                    <span> {product.discountPercent}% OFF </span>
                  </div>
                )}
                <button
                  type="button"
                  className="favourite_add_to_cart"
                  style={{
                    opacity: hoveredProductId === productId ? 1 : 0,
                    pointerEvents:
                      hoveredProductId === productId ? "auto" : "none",
                    transform:
                      hoveredProductId === productId
                        ? "translateY(0)"
                        : "translateY(8px)",
                  }}
                  onClick={(event) => handleAddToCart(event, product)}
                >
                  Add to cart
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
export default Favorites;
