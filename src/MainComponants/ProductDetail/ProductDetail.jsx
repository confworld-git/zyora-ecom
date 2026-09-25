import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext";

const ProductDetail = () => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/products/get_products`,
        );
        const matchingProduct = response.data.find(
          (item) => String(item.id ?? item._id) === String(id),
        );

        if (!matchingProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(matchingProduct);
        setSelectedImage(matchingProduct.images?.[0] || "");
      } catch (requestError) {
        console.error("Error fetching product:", requestError);
        setError("Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  if (loading) {
    return <main className="product-detail-state">Loading product...</main>;
  }

  if (error || !product) {
    return (
      <main className="product-detail-state">
        <p>{error || "Product not found."}</p>
        <Link to="/Zyora_Category">Back to categories</Link>
      </main>
    );
  }

  const productName = product.name || product.title;
  const ratingAverage = product.rating?.average ?? 0;
  const displayedRating = Math.round(ratingAverage * 2) / 2;
  const information = product.product_information || {};
  const details = [
    ["Features & Specifications", information.features_specs],
    ["Style", information.style],
    ["Measurements", information.measurements],
    ["Materials & Care", information.materials_care],
    ["Item Details", information.item_details],
  ];

  const colorRequired = product.variants?.colours?.length > 0;
  const sizeRequired = product.variants?.sizes?.length > 0;

  const validateSelection = () => {
    if (colorRequired && !selectedColor) {
      toast.error("Please select a color");
      return false;
    }
    if (sizeRequired && !selectedSize) {
      toast.error("Please select a size");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    const selectedProduct = {
      ...product,
      images: selectedImage ? [selectedImage] : [],
    };

    addToCart(selectedProduct, selectedColor, selectedSize);
    toast.success("Added to cart");
  };

  const handleAddFav = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const selectedProduct = {
      ...product,
      images: selectedImage ? [selectedImage] : [],
    };

    toggleWishlist(selectedProduct);
  };

  return (
    <main className="product-detail-page">
      <Link className="back-link" to="/Zyora_Category">
        Back to categories
      </Link>

      <section className="product-detail-hero">
        <div className="product-detail-gallery">
          {product.images?.length > 0 ? (
            product.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${productName} ${index + 1}`}
                onClick={() => setSelectedImage(image)}
              />
            ))
          ) : (
            <div className="no-image">No image available</div>
          )}
        </div>

        <div className="preview_image_big">
          <img src={selectedImage} alt={productName} />
        </div>

        <div className="product-detail-summary">
          <small>{product.brand}</small>
          <p className="product-category">{product.category}</p>
          <h1>{productName}</h1>
          <p className="product-title">{product.title}</p>

          <div className="detail-price">
            <strong>₹{product.price?.selling_price}</strong>
            <del>₹{product.price?.mrp}</del>
            <span>{product.price?.discount_percent}% OFF</span>
          </div>

          <div className="color-selection">
            <h3>Color</h3>
            <div className="color-options">
              {product.variants?.colours?.length > 0 ? (
                product.variants.colours.map((color) => (
                  <button
                    className={selectedColor === color ? "selected" : ""}
                    key={color}
                    type="button"
                    aria-label={`Select ${color} color`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))
              ) : (
                <span className="no-colors">Not specified</span>
              )}
            </div>
          </div>
          <div className="size-selection">
            <h3>Size</h3>
            <div className="size-options">
              {product.variants?.sizes?.length > 0 ? (
                product.variants.sizes.map((size) => (
                  <button
                    className={selectedSize === size ? "selected" : ""}
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span className="no-sizes">Not specified</span>
              )}
            </div>
          </div>
          <div className="product_btns">
            <button type="button" onClick={handleAddFav}>
              {isInWishlist(product?.id ?? product?._id)
                ? "Changed my mind"
                : "This one's mine"}
              <i
                className={
                  isInWishlist(product?.id ?? product?._id)
                    ? "bi bi-heart-fill"
                    : "bi bi-heart"
                }
              ></i>
            </button>
            <button type="button" onClick={handleAddToCart}>
              Add to cart <i className="bi bi-bag-check"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="product-detail-section">
        <h2>About This Item</h2>
        {product.about_this_item?.length > 0 ? (
          <ul>
            {product.about_this_item.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No description available.</p>
        )}
      </section>

      <section className="product-detail-section detail-grid">
        <div>
          <h2>Variants</h2>
          <div className="variant-colours">
            <span>Colours:</span>
            {product.variants?.colours?.length > 0 ? (
              product.variants.colours.map((color) => (
                <span className="variant-colour" key={color}>
                  <span
                    className="variant-colour-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={color}
                  />
                  {color}
                </span>
              ))
            ) : (
              <span>Not specified</span>
            )}
          </div>
          <p>
            Sizes:
            <span>
              {product.variants?.sizes?.join(", ") || "Not specified"}
            </span>
          </p>
        </div>
        <div>
          <h2>Rating</h2>
          <div
            className="rating-display"
            aria-label={`${ratingAverage} out of 5 stars`}
          >
            <span className="rating-stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  className={
                    displayedRating >= index + 1
                      ? "full"
                      : displayedRating >= index + 0.5
                        ? "half"
                        : "empty"
                  }
                  key={index}
                >
                  ★
                </span>
              ))}
            </span>
            <span>
              {ratingAverage} / 5 ({product.rating?.count ?? 0} reviews)
            </span>
          </div>
        </div>
      </section>

      {details.some(
        ([, values]) => values && Object.keys(values).length > 0,
      ) && (
        <section className="product-detail-section">
          <h2>Product Information</h2>
          <div className="information-grid">
            {details.map(([heading, values]) =>
              values && Object.keys(values).length > 0 ? (
                <div key={heading}>
                  <h3>{heading}</h3>
                  {Object.entries(values).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {value}
                    </p>
                  ))}
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetail;
