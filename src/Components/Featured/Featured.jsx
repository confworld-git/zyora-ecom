import "./Featured.css";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const FILTERS = [
  {
    id: "all",
    title: "All Products",
    description: "Browse the full collection.",
  },
  {
    id: "new",
    title: "New Arrivals",
    description: "Fresh finds, just landed.",
  },
  {
    id: "bestseller",
    title: "Best Sellers",
    description: "Loved by our customers.",
  },
  {
    id: "under499",
    title: "Under ₹499",
    description: "Great picks that won't break the bank.",
  },
];

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const getProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products/get_products`,
          { signal: controller.signal },
        );
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        if (axios.isCancel(requestError)) return;
        console.error("Error fetching featured products:", requestError);
        setError("Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();

    // Prevents "state update on an unmounted component" if this
    // component unmounts before the request resolves.
    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case "new":
        return [...products]
          .sort(
            (first, second) =>
              new Date(second.createdAt || 0) - new Date(first.createdAt || 0),
          )
          .slice(0, 8);
      case "bestseller":
        return products.filter((product) => product.is_best_seller);
      case "under499":
        return products.filter(
          (product) => Number(product.price?.selling_price) <= 499,
        );
      default:
        return products;
    }
  }, [activeFilter, products]);

  // Derive categories from the *filtered* list so we never render an
  // empty category section (no more silent `return null` cases below).
  const categories = useMemo(
    () => [
      ...new Set(
        filteredProducts.map((product) => product.category).filter(Boolean),
      ),
    ],
    [filteredProducts],
  );

  return (
    <div className="Featured_Collection">
      <h1>
        Featured <span>Collections</span> Banner
      </h1>
      <p>Handpicked selections tailored to your lifestyle</p>

      <section aria-label="Featured product filters">
        {FILTERS.map((filter) => (
          <button
            className={activeFilter === filter.id ? "active" : ""}
            key={filter.id}
            type="button"
            aria-pressed={activeFilter === filter.id}
            onClick={() => setActiveFilter(filter.id)}
          >
            <h3>{filter.title}</h3>
            <p>{filter.description}</p>
          </button>
        ))}
      </section>

      {loading ? (
        <p className="featured_status" role="status">
          Loading products...
        </p>
      ) : error ? (
        <p className="featured_status" role="alert">
          {error}
        </p>
      ) : filteredProducts.length === 0 ? (
        <p className="featured_status">
          No products match this collection yet.
        </p>
      ) : (
        categories.map((category) => {
          const categoryProducts = filteredProducts.filter(
            (product) => product.category === category,
          );

          return (
            <div className="category_section" key={category}>
              <div className="category_heading">
                <h2>{category}</h2>
                {/* <span>
                  {categoryProducts.length}
                  {categoryProducts.length === 1 ? "product" : "products"}
                </span> */}
                <Link
                  className="explore_category_link"
                  to={`/Zyora_Category?category=${encodeURIComponent(category)}`}
                >
                  Explore more <i class="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="collections_imgs">
                {categoryProducts.map((product, index) => {
                  const productKey = product.id || product._id || index;
                  return (
                    <Link
                      className="product_card"
                      key={productKey}
                      to={`/product/${product.id || product._id}`}
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].alt}
                        />
                      ) : (
                        <div className="featured_no_image">
                          No image available
                        </div>
                      )}
                      <div className="product_info">
                        <p className="featured_brand">{product.brand}</p>
                        <h2>{product.name || product.title}</h2>
                        <div className="product_price_row">
                          <p id="product_price">
                            ₹{product.price?.selling_price}
                          </p>
                          {product.price?.mrp && (
                            <p className="product_mrp">₹{product.price.mrp}</p>
                          )}
                          {product.price?.discount_percent ? (
                            <p className="product_discount">
                              {product.price.discount_percent}% off
                            </p>
                          ) : null}
                        </div>
                        <p className="product_description_clamp">
                          {product.about_this_item?.[0] || product.title}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Featured;
