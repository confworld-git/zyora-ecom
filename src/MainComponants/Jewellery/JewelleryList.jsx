import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../Context/ProductContext.jsx";
import { isImitationJewellery } from "../../utils/productCategory.js";
import { createProductPath, getProductId } from "../../utils/productSlug.js";
import "./Jewellery.css";

const JewelleryList = ({ selectedSubcategory = "",}) => {
  const { products, loading, error } = useProducts();
  const jewelleryProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          isImitationJewellery(product) &&
          (!selectedSubcategory ||
            String(product.subcategory || "")
              .trim()
              .toLowerCase() === selectedSubcategory.trim().toLowerCase()),
      ),
    [products, selectedSubcategory],
  );

  return (
    <div>
      <section
        className="zyora-jewellery-collection"
        aria-labelledby="zyora-jewellery-heading"
      >
        {loading ? (
          <p className="zyora-jewellery-state" role="status">
            Loading jewellery...
          </p>
        ) : error ? (
          <p className="zyora-jewellery-state" role="alert">
            {error}
          </p>
        ) : jewelleryProducts.length === 0 ? (
          <p className="zyora-jewellery-state">
            No imitation jewellery available yet.
          </p>
        ) : (
          <div className="zyora-jewellery-grid">
            {jewelleryProducts.map((product, index) => {
              const productId = getProductId(product);
              const productName = product.name || product.title;
              const productPath = createProductPath(product);

              if (!productPath) return null;

              const sellingPrice = Number(product.price?.selling_price);
              const mrp = Number(product.price?.mrp);

              return (
                <Link
                  className="zyora-jewellery-card"
                  key={productId}
                  style={{ "--card-index": Math.min(index, 8) }}
                  to={productPath}
                  state={{ from: "/Jewellery" }}
                >
                  <div className="zyora-jewellery-image-wrap">
                    {product.images?.[0]?.url ? (
                      <img
                        className="zyora-jewellery-image"
                        src={product.images[0].url}
                        alt={
                          product.images[0].alt ||
                          productName ||
                          "Imitation jewellery"
                        }
                        loading="lazy"
                      />
                    ) : (
                      <div className="zyora-jewellery-image-placeholder">
                        Image coming soon
                      </div>
                    )}
                    {product.price?.discount_percent ? (
                      <span className="zyora-jewellery-badge">
                        {product.price.discount_percent}% off
                      </span>
                    ) : null}
                    {/* <span className="zyora-jewellery-card-cta">
                      Discover piece <span aria-hidden="true">↗</span>
                    </span> */}
                  </div>

                  <div className="zyora-jewellery-card-info">
                    <div className="zyora-jewellery-card-title">
                      {product.brand && (
                        <span className="zyora-jewellery-brand">
                          {product.brand}
                        </span>
                      )}
                      <h3>{productName || "Imitation jewellery"}</h3>
                    </div>
                    <div className="zyora-jewellery-price">
                      {Number.isFinite(sellingPrice) && (
                        <span className="zyora-jewellery-selling-price">
                          ₹{sellingPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {Number.isFinite(mrp) &&
                        mrp > sellingPrice &&
                        sellingPrice > 0 && (
                          <span className="zyora-jewellery-mrp">
                            ₹{mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      {/* {product.price?.discount_percent ? (
                      <span className="zyora-jewellery-discount">
                        Save {product.price.discount_percent}%
                      </span>
                    ) : null} */}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default JewelleryList;
