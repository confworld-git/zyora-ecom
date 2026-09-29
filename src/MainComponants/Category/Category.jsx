import "./Category.css";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useProducts } from "../../Context/ProductContext.jsx";
import SEO from "../../SEO.jsx";

const clothingSizeLabels = {
  S: "S - Small",
  M: "M - Medium",
  L: "L - Large",
  XL: "XL - Extra Large",
  XXL: "XXL",
  XXXL: "XXXL",
};

const Category = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const { products } = useProducts();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeSliderSize, setSizeSliderSize] = useState("");

  const MIN_PRODUCT_PRICE = useMemo(() => {
    const sellingPrices = products
      .map((product) => product.price?.selling_price)
      .filter((price) => price !== undefined && price !== null && price !== "")
      .map(Number)
      .filter(Number.isFinite);

    return sellingPrices.length ? Math.min(...sellingPrices) : 0;
  }, [products]);

  const [filters, setFilters] = useState({
    categories: selectedCategory ? [selectedCategory] : [],

    priceMin: null,
    priceMax: null,

    colors: [],
    sizes: [],

    inStock: false,
    rating: false,

    sort: "relevance",
  });

  const categoryOptions = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ].sort();
  }, [products]);

  const maxProductPrice = useMemo(() => {
    const highestPrice = products.reduce(
      (highest, product) =>
        Math.max(highest, Number(product.price?.selling_price) || 0),
      0,
    );

    return Math.max(MIN_PRODUCT_PRICE, Math.ceil(highestPrice / 500) * 500);
  }, [products, MIN_PRODUCT_PRICE]);

  const SLIDER_MIN_PRICE = useMemo(() => {
    return Math.floor(MIN_PRODUCT_PRICE / 50) * 50;
  }, [MIN_PRODUCT_PRICE]);

  const SLIDER_MAX_PRICE = useMemo(() => {
    return Math.ceil(maxProductPrice / 50) * 50;
  }, [maxProductPrice]);

  const priceMin = filters.priceMin ?? SLIDER_MIN_PRICE;

  const availableProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const title = product.title || "";
      const brand = product.brand || "";
      const category = product.category || "";

      const productText = `${title} ${brand} ${category}`.toLowerCase();

      const matchesSearch = !search || productText.includes(search);

      const matchesCategory =
        !filters.categories.length ||
        filters.categories.some(
          (selectedCategory) =>
            String(selectedCategory).toLowerCase() ===
            String(category).toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filters.categories]);

  const colorOptions = useMemo(() => {
    const colors = availableProducts.flatMap(
      (product) => product.variants?.colours || [],
    );

    return [...new Set(colors.filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [availableProducts]);

  const sizeOptions = useMemo(() => {
    const sizes = availableProducts.flatMap(
      (product) => product.variants?.sizes || [],
    );

    return [...new Set(sizes.filter(Boolean))];
  }, [availableProducts]);

  const activeColors = useMemo(() => {
    const availableColors = new Set(
      colorOptions.map((color) => String(color).toLowerCase()),
    );

    return filters.colors.filter((color) =>
      availableColors.has(String(color).toLowerCase()),
    );
  }, [colorOptions, filters.colors]);

  const activeSizes = useMemo(() => {
    if (!sizeSliderSize) {
      return [];
    }

    const selectedSize = sizeOptions.find(
      (size) => String(size).toLowerCase() === sizeSliderSize.toLowerCase(),
    );

    return selectedSize ? [selectedSize] : [];
  }, [sizeOptions, sizeSliderSize]);

  const selectSingleFilter = (filterName, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: [value],
    }));
  };

  const priceRangeSpan = Math.max(SLIDER_MAX_PRICE - SLIDER_MIN_PRICE, 1);

  const currentPriceMax = filters.priceMax ?? SLIDER_MAX_PRICE;

  const priceStartPercent =
    ((priceMin - SLIDER_MIN_PRICE) / priceRangeSpan) * 100;

  const priceEndPercent =
    ((currentPriceMax - SLIDER_MIN_PRICE) / priceRangeSpan) * 100;

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const price = Number(product.price?.selling_price) || 0;
      const title = product.title || "";
      const brand = product.brand || "";
      const category = product.category || "";
      const productText = `${title} ${brand} ${category}`.toLowerCase();
      const productColors = product.variants?.colours || [];
      const productSizes = product.variants?.sizes || [];
      const matchesSearch = !search || productText.includes(search);
      const matchesCategory =
        !filters.categories.length ||
        filters.categories.some(
          (selectedCategory) =>
            String(selectedCategory).toLowerCase() ===
            String(category).toLowerCase(),
        );

      const matchesColor =
        !activeColors.length ||
        activeColors.some((selectedColor) =>
          productColors.some(
            (productColor) =>
              String(productColor).toLowerCase() ===
              String(selectedColor).toLowerCase(),
          ),
        );

      const matchesSize =
        !activeSizes.length ||
        activeSizes.some((selectedSize) =>
          productSizes.some(
            (productSize) =>
              String(productSize).toLowerCase() ===
              String(selectedSize).toLowerCase(),
          ),
        );

      const matchesStock = !filters.inStock || product.stock?.in_stock === true;
      const matchesRating =
        !filters.rating || (Number(product.rating?.average) || 0) >= 4;

      const matchesProductPrice =
        price >= (filters.priceMin ?? SLIDER_MIN_PRICE) &&
        price <= (filters.priceMax ?? SLIDER_MAX_PRICE);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesSize &&
        matchesStock &&
        matchesRating &&
        matchesProductPrice
      );
    });

    result.sort((firstProduct, secondProduct) => {
      const firstPrice = Number(firstProduct.price?.selling_price) || 0;

      const secondPrice = Number(secondProduct.price?.selling_price) || 0;

      if (filters.sort === "price-low") {
        return firstPrice - secondPrice;
      }

      if (filters.sort === "price-high") {
        return secondPrice - firstPrice;
      }

      return 0;
    });

    return result;
  }, [
    activeColors,
    activeSizes,
    products,
    searchTerm,
    filters,
    SLIDER_MIN_PRICE,
    SLIDER_MAX_PRICE,
  ]);

  const clearFilters = () => {
    setSearchTerm("");

    setSizeSliderSize("");

    setSearchParams({}, { replace: true });

    setFilters({
      categories: [],
      priceMin: null,
      priceMax: null,
      colors: [],
      sizes: [],
      inStock: false,
      rating: false,
      sort: "relevance",
    });
  };

  const getColorLabel = (color) => {
    if (!color) {
      return "";
    }

    if (String(color).startsWith("#")) {
      return String(color).toUpperCase();
    }

    return color;
  };

  const getSizeLabel = (size) => {
    const normalizedSize = String(size).toUpperCase();

    return clothingSizeLabels[normalizedSize] || size;
  };

  const showVariantFilters =
    Boolean(searchTerm.trim()) || filters.categories.length > 0;

  const sizeSliderIndex = sizeOptions.findIndex(
    (size) => String(size).toLowerCase() === sizeSliderSize.toLowerCase(),
  );

  const sizeSliderMax = sizeOptions.length;

  const sizeSliderValue = sizeSliderIndex >= 0 ? sizeSliderIndex + 1 : 0;

  const sizeSliderPosition =
    sizeSliderValue > 0 && sizeSliderMax > 0
      ? (sizeSliderValue / sizeSliderMax) * 100
      : 0;

  const openProduct = (product) => {
    const productId = product.id || product._id;

    if (!productId) {
      console.error("Product ID missing:", product);

      return;
    }

    const slug = (product.name || product.title)
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    navigate(`/Zyora_Category/product/${productId}/${slug}`);
  };

  return (
    <>
      <SEO
        title="Shop All Categories | ZYORA"
        description="Explore all product categories at ZYORA and discover quality, functional and affordable products for everyday life. Shop home and kitchen essentials, stationery, handbags, soft toys, fashion, footwear, electronics, watches, beauty, sports and fitness, and more. Find products that fit your needs with secure payments, reliable delivery and easy 7-day returns."
        canonical={`${import.meta.env.VITE_API_DOMAIN}/Zyora_Category`}
      />
      <div className="category">
        <div id="page_path">
          <p>
            Home
            <MdKeyboardArrowRight />
            Categories
          </p>
        </div>

        <h1>Categories</h1>

        <p>
          Explore our wide range of carefully selected categories, made to bring
          style, comfort, and convenience to your everyday life.
        </p>

        <section>
          <div className="categories_list">
            <div className="collection_search">
              <i className="bi bi-search"></i>

              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="filter_panel">
              <fieldset>
                <legend>Category</legend>

                {categoryOptions.map((category) => (
                  <label key={category}>
                    <input
                      type="radio"
                      name="category"
                      checked={
                        String(filters.categories[0] || "").toLowerCase() ===
                        String(category).toLowerCase()
                      }
                      onChange={() =>
                        setFilters((current) => ({
                          ...current,
                          categories: [category],
                        }))
                      }
                    />

                    {category}
                  </label>
                ))}
              </fieldset>

              <fieldset className="price_filter">
                <legend>Price</legend>

                <div className="price_range_values">
                  <span>₹{priceMin.toLocaleString("en-IN")}</span>

                  <span>₹{currentPriceMax.toLocaleString("en-IN")}</span>
                </div>

                <div
                  className="price_slider"
                  style={{
                    "--range-start": `${Math.max(
                      0,
                      Math.min(100, priceStartPercent),
                    )}%`,

                    "--range-end": `${Math.max(
                      0,
                      Math.min(100, priceEndPercent),
                    )}%`,
                  }}
                >
                  <div className="price_slider_track" />
                  <input
                    aria-label="Minimum price"
                    className="price_range price_range_min"
                    type="range"
                    min={SLIDER_MIN_PRICE}
                    max={SLIDER_MAX_PRICE}
                    step={50}
                    value={priceMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);

                      setFilters((current) => ({
                        ...current,

                        priceMin: Math.min(
                          value,
                          current.priceMax ?? SLIDER_MAX_PRICE,
                        ),
                      }));
                    }}
                  />

                  <input
                    aria-label="Maximum price"
                    className="price_range price_range_max"
                    type="range"
                    min={SLIDER_MIN_PRICE}
                    max={SLIDER_MAX_PRICE}
                    step={50}
                    value={currentPriceMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);

                      setFilters((current) => ({
                        ...current,

                        priceMax: Math.max(
                          value,
                          current.priceMin ?? SLIDER_MIN_PRICE,
                        ),
                      }));
                    }}
                  />
                </div>

                <small className="price_range_hint">
                  Drag either handle to refine
                </small>
              </fieldset>

              {showVariantFilters && (
                <>
                  <FilterGroup
                    title="Color"
                    options={colorOptions}
                    selected={filters.colors}
                    inputType="radio"
                    name="color"
                    onToggle={(value) => selectSingleFilter("colors", value)}
                    getLabel={getColorLabel}
                  />

                  <fieldset className="size_filter">
                    <legend>Size</legend>

                    <div className="size_slider">
                      <div
                        className={`size_range_value${
                          sizeSliderValue === 0
                            ? " is_start"
                            : sizeSliderValue === sizeSliderMax
                              ? " is_end"
                              : ""
                        }`}
                        style={{
                          left: `${sizeSliderPosition}%`,
                        }}
                      >
                        {sizeSliderIndex >= 0
                          ? getSizeLabel(sizeOptions[sizeSliderIndex])
                          : "Any size"}
                      </div>

                      <div
                        className="price_slider_track"
                        style={{
                          "--range-start": "0%",

                          "--range-end": `${sizeSliderPosition}%`,
                        }}
                      />

                      <input
                        aria-label="Size"
                        className="size_range"
                        type="range"
                        min="0"
                        max={sizeSliderMax}
                        step="1"
                        value={sizeSliderValue}
                        disabled={!sizeOptions.length}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setSizeSliderSize(
                            value === 0 ? "" : String(sizeOptions[value - 1]),
                          );
                        }}
                      />
                    </div>
                  </fieldset>
                </>
              )}

              <fieldset>
                <legend>Availability</legend>

                <label>
                  <input
                    type="radio"
                    name="availability"
                    checked={filters.inStock}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,

                        inStock: event.target.checked,
                      }))
                    }
                  />
                  In Stock
                </label>
              </fieldset>

              <fieldset>
                <legend>Rating</legend>

                <label>
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,

                        rating: event.target.checked,
                      }))
                    }
                  />
                  ⭐ 4 & above
                </label>
              </fieldset>

              <button
                className="clear_filters"
                type="button"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="category_results">
            <div className="sort_row">
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </span>

              <label>
                Sort by:
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,

                      sort: event.target.value,
                    }))
                  }
                >
                  <option value="relevance">Relevance</option>

                  <option value="price-low">Price: low to high</option>

                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>

            <div className="categories_items">
              {filteredProducts.map((product) => {
                const productId = product.id || product._id;

                return (
                  <div
                    className="product_card"
                    key={productId}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProduct(product)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        openProduct(product);
                      }
                    }}
                  >
                    <img
                      src={product.images?.[0]?.url}
                      alt={
                        product.images?.[0]?.alt || product.title || "Product"
                      }
                    />

                    <p className="rating_pre">
                      ⭐ {product.rating?.average ?? 0} (
                      {product.rating?.count ?? 0})
                    </p>

                    <small>{product.brand}</small>

                    <p className="product_description">{product.title}</p>

                    <div className="price">
                      <strong>
                        Rs.
                        {product.price?.selling_price}
                      </strong>

                      <del>
                        Rs.
                        {product.price?.mrp}
                      </del>

                      <span>({product.price?.discount_percent}% OFF)</span>
                    </div>

                    {/* <span>add to fav</span> */}
                  </div>
                );
              })}

              {!filteredProducts.length && (
                <p className="empty_results">No products available.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const FilterGroup = ({
  title,
  options,
  selected,
  onToggle,
  getLabel,
  inputType = "checkbox",
  name,
}) => {
  return (
    <fieldset>
      <legend>{title}</legend>

      {options.map((option) => {
        const value = option?.value ?? option;

        const label = getLabel ? getLabel(value) : (option?.label ?? option);

        const isSelected = selected.some(
          (item) => String(item).toLowerCase() === String(value).toLowerCase(),
        );

        return (
          <label key={String(value)}>
            <input
              type={inputType}
              name={name}
              checked={isSelected}
              onChange={() => onToggle(value)}
            />

            {label}
          </label>
        );
      })}
    </fieldset>
  );
};

export default Category;
