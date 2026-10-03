import "./Featured.css";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../Context/ProductContext";

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
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState("all");

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

                <Link
                  className="explore_category_link"
                  to={`/Zyora_Category?category=${encodeURIComponent(
                    category,
                  )}`}
                >
                  Explore more <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="collections_imgs">
                {categoryProducts.map((product, index) => {
                  const productId = product.id || product._id;
                  const slug = (product.name || product.title)
                    ?.toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");

                  const productUrl = `/Zyora_Category/product/${productId}/${slug}`;
                  return (
                    <Link className="product_card_1" key={index} to={productUrl}>
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={
                            product.images[0].alt ||
                            product.name ||
                            product.title ||
                            "Product"
                          }
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
