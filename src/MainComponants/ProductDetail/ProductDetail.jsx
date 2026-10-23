import "./ProductDetail.css";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext";
import { useProducts } from "../../Context/ProductContext.jsx";
import ProductZoom from "./ProductZoom.jsx";
import { MdKeyboardArrowRight } from "react-icons/md";
import SEO from "../../SEO.jsx";
import ScrollReveal from "../../Components/ScrollReveal.jsx";
import { Helmet } from "react-helmet-async";
import { normalizeProductRating } from "../../utils/productRating.js";

const ProductDetail = () => {
  const { addToCart, isCartSyncing } = useCart();
  const { toggleWishlist, isInWishlist, isWishlistSyncing } = useWishlist();
  const { loading, error: productsError, getProductById } = useProducts();
  const { productId, slug } = useParams();
  const location = useLocation();
  const categoryPath = location.state?.from?.startsWith(
    "/Zyora_Category?category=",
  )
    ? location.state.from
    : "";
  const productListPath =
    location.state?.from === "/Jewellery"
      ? "/Jewellery"
      : categoryPath || "/Zyora_Category";
  const categoryName = categoryPath
    ? new URLSearchParams(categoryPath.split("?")[1]).get("category")
    : "";
  const productListLabel =
    productListPath === "/Jewellery"
      ? "Jewellery"
      : categoryName || "Categories";
  const id = productId;
  const product = getProductById(id);
  const [selectionsByProduct, setSelectionsByProduct] = useState({});
  const selection = selectionsByProduct[id] || {};

  const updateSelection = (key, value) => {
    setSelectionsByProduct((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }));
  };

  if (loading) {
    return <main className="product-detail-state">Loading product...</main>;
  }

  if (productsError || !product) {
    return (
      <main className="product-detail-state">
        <p>{productsError || "Product not found."}</p>
        <Link to={productListPath}>
          Back to {productListLabel.toLowerCase()}
        </Link>
      </main>
    );
  }

  const productStockQuantity = Number(product.stock?.quantity) || 0;
  const productOutOfStock =
    product.stock?.in_stock !== true || productStockQuantity <= 0;
  const images = product.images || [];
  const videoUrl =
    typeof product.video === "string"
      ? product.video
      : product.video?.url || "";
  const isVideoSelected = selection.showVideo === true && Boolean(videoUrl);
  const colourNames = (product.variants?.colours || []).map((name) =>
    String(name ?? "").trim(),
  );

  // Colour #1 belongs to image #1, colour #2 to image #2, and so on.
  // Images after the last colour (extra angles, a second chain in the same
  // colour...) are gallery photos only and are not colour options.
  const colorOptions = colourNames
    .map((name, index) => ({
      id: images[index]?.id,
      color: images[index]?.color,
      name,
      image: images[index],
    }))
    .filter((option) => option.name && option.image);

  // Selected image (defaults to first image)
  const activeImage =
    selection.image ??
    images.find((image) => image.url === location.state?.selectedImage) ??
    images[0] ??
    null;
  const selectedImage = activeImage?.url ?? "";

  // Selected colour: the one the customer picked, else the one that matches
  // the shown image, else the only colour when there is just one
  const selectedColorOption =
    colorOptions.find((option) => option.id === selection.colorId) ??
    colorOptions.find((option) => option.id === activeImage?.id) ??
    (colorOptions.length === 1 ? colorOptions[0] : undefined);
  const selectedColor = selectedColorOption?.name ?? "";
  const selectedSize = selection.size ?? "";
  const selectedColorStock = product.variants?.colorStock?.find(
    (item) =>
      String(item.color || "")
        .trim()
        .toLowerCase() === selectedColor.trim().toLowerCase(),
  );
  const hasColorStock = (product.variants?.colorStock || []).length > 0;
  const stockQuantity = hasColorStock
    ? Number(selectedColorStock?.quantity) || 0
    : productStockQuantity;
  const isOutOfStock = hasColorStock
    ? !selectedColorStock ||
      selectedColorStock.enabled === false ||
      stockQuantity <= 0
    : productOutOfStock;

  const selectImage = (image) => {
    const option = colorOptions.find((item) => item.id === image.id);

    setSelectionsByProduct((current) => ({
      ...current,
      [id]: {
        ...current[id],
        image,
        showVideo: false,
        ...(option && { colorId: option.id }),
      },
    }));
  };

  const productName = product.name || product.title;
  const { average: ratingAverage, count: ratingCount } = normalizeProductRating(
    product.rating,
  );
  const displayedRating = Math.round(ratingAverage * 2) / 2;
  const information = product.product_information || {};
  const details = [
    ["Features & Specifications", information.features_specs],
    ["Style", information.style],
    ["Measurements", information.measurements],
    ["Materials & Care", information.materials_care],
    ["Item Details", information.item_details],
  ];

  const colorRequired = colorOptions.length > 0;
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

    if (addToCart(id, selectedColor, selectedSize, selectedImage)) {
      toast.success("Added to cart");
    } else {
      toast.error("Unable to add this product to cart");
    }
  };

  const handleAddFav = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(id, selectedImage);
  };

  const seoDescription = (
    product.title ||
    product.about_this_item?.join(". ") ||
    `${productName} from ${product.brand || "ZYORA"}`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);

  const frontendUrl = (
    import.meta.env.VITE_API_DOMAIN || window.location.origin
  ).replace(/\/$/, "");

  const productUrl = `${frontendUrl}/Zyora_Category/product/${encodeURIComponent(
    product.id,
  )}/${encodeURIComponent(slug)}`;

  const productImages = images.map((image) => image.url).filter(Boolean);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: seoDescription,
    sku: product.id,
    ...(productImages.length > 0 && {
      image: productImages,
    }),
    brand: {
      "@type": "Brand",
      name: product.brand || "ZYORA",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: product.price?.currency || "INR",
      price: String(product.price?.selling_price ?? ""),
      availability: !isOutOfStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <SEO
        title={`${product.name} | ${product.brand || "ZYORA"} | ZYORA`}
        description={seoDescription}
        canonical={`${import.meta.env.VITE_API_DOMAIN}/Zyora_Category/product/${product.id}/${slug}`}
        jsonLd={productJsonLd}
      />
      <Helmet>
        <meta property="og:type" content="product" />

        <meta
          property="og:title"
          content={`${productName} | ${product.brand || "ZYORA"} | ZYORA`}
        />

        <meta property="og:description" content={seoDescription} />

        <meta property="og:url" content={productUrl} />

        {productImages[0] && (
          <meta property="og:image" content={productImages[0]} />
        )}

        <meta
          property="product:price:amount"
          content={String(product.price?.selling_price ?? "")}
        />

        <meta
          property="product:price:currency"
          content={product.price?.currency || "INR"}
        />
      </Helmet>
      <ScrollReveal as="main" className="product-detail-page">
        <div id="page_path">
          <p>
            <Link to="/">Home</Link>
            <MdKeyboardArrowRight />
            <Link to={productListPath}>{productListLabel}</Link>
            <MdKeyboardArrowRight />
            <span aria-current="page">{slug}</span>
          </p>
        </div>
        <ScrollReveal as="section" className="product-detail-hero">
          <div className="product-detail-gallery">
            {images.length > 0 ? (
              images.map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt || productName}
                  className={activeImage?.id === image.id ? "selected" : ""}
                  onClick={() => selectImage(image)}
                />
              ))
            ) : (
              <div className="no-image">No image available</div>
            )}
            {videoUrl && (
              <button
                className={`product-video-thumbnail ${isVideoSelected ? "selected" : ""}`}
                type="button"
                aria-label={`Play ${productName} video`}
                aria-pressed={isVideoSelected}
                onClick={() => updateSelection("showVideo", true)}
              >
                {images[0]?.url && (
                  <img
                    className="product-video-poster"
                    src={images[0].url}
                    alt=""
                    aria-hidden="true"
                  />
                )}
                <span aria-hidden="true">▶</span>
              </button>
            )}
          </div>

          <div className="product-detail-main-media">
            {isVideoSelected ? (
              <video
                className="product-detail-video-player"
                src={videoUrl}
                poster={images[0]?.url}
                // controls
                playsInline
                preload="metadata"
                autoPlay
              >
                Your browser does not support embedded videos.
              </video>
            ) : (
              <ProductZoom image={selectedImage} />
            )}
          </div>

          <div className="product-detail-summary">
            <small>{product.brand}</small>
            {/* <p className="product-category">{product.category}</p> */}
            <h1>{productName}</h1>
            <p className="product-title">{product.title}</p>

            <div className="detail-price">
              <strong>₹{product.price?.selling_price}</strong>
              <del>₹{product.price?.mrp}</del>
              <span>{product.price?.discount_percent}% OFF</span>
            </div>
            <p className="product-quantity">
              <span>Availability</span>
              <strong
                className={productOutOfStock ? "out-of-stock" : "in-stock"}
              >
                {productOutOfStock
                  ? "Out of stock"
                  : `In stock (${productStockQuantity})`}
              </strong>
            </p>
            <div className="color-selection">
              <h3>
                Color
                {selectedColor && (
                  <>
                    : <span>{selectedColor}</span>
                  </>
                )}
              </h3>
              <div className="color-options">
                {colorOptions.length > 0 ? (
                  colorOptions.map((option) => {
                    const optionStock = (
                      product.variants?.colorStock || []
                    ).find(
                      (item) =>
                        String(item.color || "")
                          .trim()
                          .toLowerCase() === option.name.trim().toLowerCase(),
                    );
                    const unavailable =
                      hasColorStock &&
                      (!optionStock ||
                        optionStock.enabled === false ||
                        Number(optionStock.quantity) <= 0);
                    return (
                      <button
                        className={`${
                          selectedColorOption?.id === option.id
                            ? "selected"
                            : ""
                        } ${option.color ? "" : "has-label"}`.trim()}
                        key={option.id}
                        type="button"
                        title={`${option.name}${unavailable ? " (out of stock)" : ""}`}
                        aria-label={`Select ${option.name} color${unavailable ? ", out of stock" : ""}`}
                        disabled={unavailable}
                        style={
                          option.color
                            ? { backgroundColor: option.color }
                            : undefined
                        }
                        onClick={() => selectImage(option.image)}
                      >
                        {!option.color && option.name}
                      </button>
                    );
                  })
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
                      onClick={() => updateSelection("size", size)}
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
              <button
                type="button"
                onClick={handleAddFav}
                disabled={isWishlistSyncing}
              >
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
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isCartSyncing || isOutOfStock}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : isCartSyncing
                    ? "Syncing cart…"
                    : "Add to cart"}{" "}
                <i className="bi bi-bag-check"></i>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal as="section" className="product-detail-section">
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
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="product-detail-section detail-grid"
        >
          <div>
            <h2>Variants</h2>
            <div className="variant-colours">
              <span>Colours:</span>
              {colorOptions.length > 0 ? (
                colorOptions.map((option) => (
                  <span className="variant-colour" key={option.id}>
                    {option.color && (
                      <span
                        className="variant-colour-swatch"
                        style={{ backgroundColor: option.color }}
                        title={option.name}
                        aria-label={option.name}
                      />
                    )}
                    {option.name}
                  </span>
                ))
              ) : (
                <span>Not specified</span>
              )}
            </div>
            <p>
              Sizes:
              <span>
                {product.variants?.sizes?.join("  |  ") || "Not specified"}
              </span>
            </p>
          </div>
          {ratingCount > 0 && (
            <div>
              <h2>Rating</h2>
              <div
                className="rating-display"
                aria-label={`${ratingAverage.toFixed(1)} out of 5 stars, ${ratingCount} ${
                  ratingCount === 1 ? "review" : "reviews"
                }`}
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
                  {`${ratingAverage.toFixed(1)} / 5 (${ratingCount} ${
                    ratingCount === 1 ? "review" : "reviews"
                  })`}
                </span>
              </div>
            </div>
          )}
        </ScrollReveal>

        {details.some(
          ([, values]) => values && Object.keys(values).length > 0,
        ) && (
          <ScrollReveal as="section" className="product-detail-section">
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
          </ScrollReveal>
        )}
      </ScrollReveal>
    </>
  );
};

export default ProductDetail;
