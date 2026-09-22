import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
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
        const matchingProduct = response.data.find((item) => item.id === id);

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
  const information = product.product_information || {};
  const details = [
    ["Features & Specifications", information.features_specs],
    ["Style", information.style],
    ["Measurements", information.measurements],
    ["Materials & Care", information.materials_care],
    ["Item Details", information.item_details],
  ];

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

          <p className={product.stock?.in_stock ? "in-stock" : "out-stock"}>
            {product.stock?.in_stock
              ? `In Stock (${product.stock.quantity ?? 0} available)`
              : "Out of Stock"}
          </p>
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

      {/* <section className="product-detail-section detail-grid">
        <div>
          <h2>Variants</h2>
          <p>
            Colours: {product.variants?.colours?.join(", ") || "Not specified"}
          </p>
          <p>Sizes: {product.variants?.sizes?.join(", ") || "Not specified"}</p>
        </div>
        <div>
          <h2>Rating</h2>
          <p>
            {product.rating?.average ?? 0} / 5 ({product.rating?.count ?? 0}{" "}
            reviews)
          </p>
        </div>
      </section> */}

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
