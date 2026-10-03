import "./Favorites.css";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext.jsx";
import { useProducts } from "../../Context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import toast from "react-hot-toast";

const Favorites = () => {
  const {
    wishlistItems,
    removeFromWishlist,
    isWishlistSyncing,
  } = useWishlist();
  const { addToCart, isCartSyncing } = useCart();
  const { getProductById } = useProducts();
  const navigate = useNavigate();

  const openProduct = (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      console.error("Product ID missing:", product);
      return;
    }

    const slug = (product.name || product.title || "product")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    navigate(
      `/Zyora_Category/product/${encodeURIComponent(productId)}/${encodeURIComponent(slug || "product")}`,
      { state: { selectedImage: product.image } },
    );
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    const productId = product.id || product._id;
    const fullProduct = getProductById(productId);

    if (!fullProduct) {
      toast.error("This product is no longer available.");
      return;
    }

    const colors = fullProduct.variants?.colours ?? fullProduct.colors ?? [];
    const sizes = fullProduct.variants?.sizes ?? fullProduct.sizes ?? [];
    const images = fullProduct.images || [];

    const imageIndex = images.findIndex(
      (image) =>
        (typeof image === "string" ? image : image.url) === product.image,
    );

    const selectedColor =
      imageIndex >= 0
        ? colors[imageIndex] ||
          (typeof images[imageIndex] === "object"
            ? images[imageIndex].color
            : "")
        : colors.length === 1
          ? colors[0]
          : "";
          
    const selectedSize = sizes.length === 1 ? sizes[0] : "";
    const requiresColor = colors.length > 0;
    const requiresSize = sizes.length > 0;

    if (requiresColor && !selectedColor) {
      toast("Choose this product’s color to add it to your cart.");
      openProduct(product);
      return;
    }

    if (requiresSize && !selectedSize) {
      toast("Choose this product’s size to add it to your cart.");
      openProduct(product);
      return;
    }

    if (addToCart(fullProduct, selectedColor, selectedSize, product.image)) {
      toast.success("Added to cart");
    } else {
      toast.error("Unable to add this product to your cart.");
    }
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
          <i className="bi bi-heartbreak-fill"></i>
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
              >
                <button
                  type="button"
                  disabled={isWishlistSyncing}
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
                  disabled={isCartSyncing}
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
