import "./Featured.css";
import { createProductPath, getProductId } from "../../utils/productSlug.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../Context/ProductContext";
import { isImitationJewellery } from "../../utils/productCategory.js";
import { useCart } from "../../Context/CartContext.jsx";

const isProductAvailable = (product) => {
  if (product.stock?.in_stock !== true || product.stock?.quantity <= 0) {
    return false;
  }

  const colours = product.variants?.colours || [];
  if (colours.length === 0) {
    return true;
  }

  const colorStock = product.variants?.colorStock;

  if (!Array.isArray(colorStock) || colorStock.length === 0) {
    return false;
  }

  return colorStock.some(
    (variant) => variant.enabled === true && variant.quantity > 0,
  );
};

const PRODUCTS_PER_CATEGORY = 4;

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
  const { addToCart } = useCart();
  const { products, loading, error } = useProducts();
  const [activeFilter, setActiveFilter] = useState("all");

  const getProductTimestamp = (product) => {
    if (product.createdAt) {
      const date = new Date(product.createdAt).getTime();
      if (!Number.isNaN(date)) return date;
    }

    if (product._id && /^[a-f\d]{24}$/i.test(product._id)) {
      return parseInt(product._id.substring(0, 8), 16) * 1000;
    }

    return 0;
  };

  const visibleProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];

    return list.filter(
      (product) =>
        product &&
        !isImitationJewellery(product) &&
        isProductAvailable(product),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case "new":
        return visibleProducts
          .filter(
            (product) =>
              product.category?.trim().toLowerCase() === "kids play zone",
          )
          .sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a));

      case "bestseller":
        return visibleProducts.filter((product) => product.is_best_seller);

      case "under499":
        return visibleProducts.filter(
          (product) => Number(product.price?.selling_price) <= 499,
        );

      default:
        return visibleProducts;
    }
  }, [activeFilter, visibleProducts]);

  const categories = useMemo(
    () => [
      ...new Set(
        filteredProducts.map((product) => product.category).filter(Boolean),
      ),
    ],
    [filteredProducts],
  );

  const getAvailableVariants = (product) => {
    const colorStock = product.variants?.colorStock || [];
    const colours = product.variants?.colours || [];
    const images = product.images || [];

    return colorStock
      .filter((variant) => variant.enabled === true && variant.quantity > 0)
      .map((variant) => {
        // Prefer an explicit image-to-variant match.
        const matchingImages = images.filter(
          (image) => image.variantColor === variant.color,
        );

        // Otherwise, use the same index in colours and images.
        const colorIndex = colours.indexOf(variant.color);

        const variantImages =
          matchingImages.length > 0
            ? matchingImages
            : colorIndex >= 0 && images[colorIndex]
              ? [images[colorIndex]]
              : [];

        return {
          ...variant,
          images: variantImages,
        };
      });
  };

  const handleCart = (id, selectedColor, selectedSize, selectedImage) => {
    addToCart(id, selectedColor, selectedSize, selectedImage);
  };

  return (
    <div className="Featured_Collection">
      <h1>
        Shop by <span>category</span>
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
          // Max 4 per category, for every filter
          const categoryProducts = filteredProducts
            .filter((product) => product.category === category)
            .slice(0, PRODUCTS_PER_CATEGORY);

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
                  const productId = getProductId(product);
                  const productUrl = createProductPath(product);
                  if (!productUrl) return null;
                  const categoryUrl = `/Zyora_Category?category=${encodeURIComponent(
                    category,
                  )}`;
                  const availableVariants = getAvailableVariants(product);
                  const firstAvailableVariant = availableVariants[0];
                  const productImage = product.images?.[0];
                  const selectedImage =
                    firstAvailableVariant?.images?.[0]?.url ||
                    (typeof productImage === "string"
                      ? productImage
                      : productImage?.url) ||
                    product.image;
                  const canAddToCart =
                    Boolean(firstAvailableVariant) ||
                    (product.variants?.colours?.length || 0) === 0;

                  return (
                    <Link
                      className="product_card_1"
                      key={productId}
                      style={{ "--card-index": Math.min(index, 8) }}
                      to={productUrl}
                      state={{ from: categoryUrl }}
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt={
                            firstAvailableVariant?.color
                              ? `${firstAvailableVariant.color} - ${product.name || product.title}`
                              : product.name || product.title
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
                          <button
                            type="button"
                            className="add_to"
                            disabled={!canAddToCart}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (!canAddToCart) return;

                              handleCart(
                                productId,
                                firstAvailableVariant?.color || "",
                                product.variants?.sizes?.[0] || "",
                                selectedImage,
                              );
                            }}
                            aria-label="Add to cart"
                          >
                            +
                          </button>
                        </div>
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
