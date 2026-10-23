import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useProducts } from "../../Context/ProductContext.jsx";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/products/admin/inventory`;
const normalizeColor = (color) =>
  String(color ?? "")
    .trim()
    .toLowerCase();

const getColorStocks = (product) => {
  const colours = product.variants?.colours || [];
  if (!colours.length) return [];
  const existing = new Map(
    (product.variants?.colorStock || []).map((item) => [
      normalizeColor(item.color),
      item,
    ]),
  );
  const hasSavedStock = existing.size > 0;
  return colours.map((color, index) => {
    const saved = existing.get(normalizeColor(color));
    return {
      color,
      quantity: Number(
        saved?.quantity ??
          (!hasSavedStock && index === 0 ? (product.stock?.quantity ?? 0) : 0),
      ),
      enabled: saved
        ? saved.enabled !== false
        : product.stock?.in_stock !== false,
    };
  });
};

const StockManagement = () => {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [quantities, setQuantities] = useState({});
  const [colorStocks, setColorStocks] = useState({});
  const [busyProduct, setBusyProduct] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API, { withCredentials: true });
      const list = response.data.products || [];
      setProducts(list);
      setQuantities(
        Object.fromEntries(
          list.map((product) => [
            product.id,
            String(product.stock?.quantity ?? 0),
          ]),
        ),
      );
      setColorStocks(
        Object.fromEntries(
          list
            .filter((product) => product.variants?.colours?.length)
            .map((product) => [product.id, getColorStocks(product)]),
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchProducts();
    });
    return () => {
      active = false;
    };
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const quantity = Number(product.stock?.quantity) || 0;
      const status =
        !product.stock?.in_stock || quantity === 0
          ? "out"
          : quantity <= 5
            ? "low"
            : "available";
      const matchesSearch =
        !query ||
        [product.id, product.name, product.brand, product.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesSearch && (filter === "all" || status === filter);
    });
  }, [products, search, filter]);

  const updateStock = async (product) => {
    if (product.variants?.colours?.length) {
      const colorStock = colorStocks[product.id] || getColorStocks(product);
      if (
        colorStock.length !== product.variants.colours.length ||
        colorStock.some(
          (item) =>
            item.quantity === "" ||
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) < 0,
        )
      ) {
        toast.error("Each colour needs a non-negative whole-number quantity");
        return;
      }
      try {
        setBusyProduct(product.id);
        const response = await axios.patch(
          `${API}/${encodeURIComponent(product.id)}`,
          {
            colorStock: colorStock.map((item) => ({
              ...item,
              quantity: Number(item.quantity),
            })),
          },
          { withCredentials: true },
        );
        setProducts((current) =>
          current.map((item) =>
            item.id === product.id ? response.data.product : item,
          ),
        );
        setColorStocks((current) => ({
          ...current,
          [product.id]: getColorStocks(response.data.product),
        }));
        if (!(await refreshProducts())) {
          toast.error(
            "Variant stock saved, but storefront data could not refresh.",
          );
        }
        toast.success("Variant stock updated");
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to update stock");
      } finally {
        setBusyProduct("");
      }
      return;
    }

    const quantity = Number(quantities[product.id]);
    if (
      quantities[product.id] === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      toast.error("Stock must be a non-negative whole number");
      return;
    }
    try {
      setBusyProduct(product.id);
      const response = await axios.patch(
        `${API}/${encodeURIComponent(product.id)}`,
        {
          quantity,
          in_stock: product.stock?.in_stock !== false,
        },
        { withCredentials: true },
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? response.data.product : item,
        ),
      );
      setQuantities((current) => ({
        ...current,
        [product.id]: String(response.data.product.stock.quantity),
      }));
      if (!(await refreshProducts())) {
        toast.error("Stock saved, but storefront data could not refresh.");
      }
      toast.success("Stock updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update stock");
    } finally {
      setBusyProduct("");
    }
  };

  const toggleAvailability = async (product) => {
    const quantity = Number(product.stock?.quantity) || 0;
    const next = product.stock?.in_stock === false;
    if (next && quantity === 0) {
      toast.error("Add stock before making this product available");
      return;
    }
    try {
      setBusyProduct(product.id);
      const response = await axios.patch(
        `${API}/${encodeURIComponent(product.id)}`,
        { quantity, in_stock: next },
        { withCredentials: true },
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? response.data.product : item,
        ),
      );
      if (!(await refreshProducts())) {
        toast.error(
          "Availability saved, but storefront data could not refresh.",
        );
      }
      toast.success(
        next ? "Product marked available" : "Product marked unavailable",
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update availability",
      );
    } finally {
      setBusyProduct("");
    }
  };

  const updateColorStockField = (productId, index, field, value) => {
    setColorStocks((current) => ({
      ...current,
      [productId]: current[productId].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const availableCount = products.filter(
    (product) => product.stock?.in_stock && Number(product.stock?.quantity) > 5,
  ).length;
  const lowCount = products.filter(
    (product) =>
      product.stock?.in_stock &&
      Number(product.stock?.quantity) > 0 &&
      Number(product.stock?.quantity) <= 5,
  ).length;
  const outCount = products.length - availableCount - lowCount;

  return (
    <main className="management-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">INVENTORY CONTROL</span>
          <h1>Stock management</h1>
          <p>Keep product quantities and storefront availability up to date.</p>
        </div>
        <button
          className="management-refresh"
          onClick={fetchProducts}
          type="button"
        >
          Refresh
        </button>
      </header>

      <section className="management-stats" aria-label="Inventory summary">
        <article>
          <span>Products</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>Healthy stock</span>
          <strong>{availableCount}</strong>
        </article>
        <article>
          <span>Low stock (1–5)</span>
          <strong>{lowCount}</strong>
        </article>
        <article>
          <span>Out of stock</span>
          <strong>{outCount}</strong>
        </article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search products"
          placeholder="Search product, brand, or SKU"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          aria-label="Filter inventory"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All products</option>
          <option value="available">Healthy stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <p className="management-empty">Loading inventory…</p>
      ) : filteredProducts.length === 0 ? (
        <p className="management-empty">
          {products.length
            ? "No products match your filters."
            : "No products are available to manage."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock by variant</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const quantity = Number(product.stock?.quantity) || 0;
                const out = !product.stock?.in_stock || quantity === 0;
                const low = !out && quantity <= 5;
                const image = product.images?.[0]?.url;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="stock-product">
                        {image ? (
                          <img src={image} alt="" />
                        ) : (
                          <span className="stock-product-placeholder">ZY</span>
                        )}
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.id}</td>
                    <td>{product.category || "—"}</td>
                    <td>
                      {product.variants?.colours?.length ? (
                        <div className="inventory-color-stocks">
                          {(
                            colorStocks[product.id] || getColorStocks(product)
                          ).map((item, index) => (
                            <div
                              className={`inventory-color-stock ${
                                !item.enabled
                                  ? "is-disabled"
                                  : Number(item.quantity) <= 0
                                    ? "is-out"
                                    : Number(item.quantity) <= 5
                                      ? "is-low"
                                      : "is-available"
                              }`}
                              key={item.color}
                            >
                              <div className="inventory-color-heading">
                                <strong>{item.color}</strong>
                                <span className="inventory-color-state">
                                  {!item.enabled
                                    ? "Disabled"
                                    : Number(item.quantity) <= 0
                                      ? "Out of stock"
                                      : Number(item.quantity) <= 5
                                        ? "Low stock"
                                        : "Available"}
                                </span>
                              </div>
                              <input
                                className="stock-quantity-input"
                                aria-label={`${item.color} stock quantity for ${product.name}`}
                                type="number"
                                min="0"
                                step="1"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateColorStockField(
                                    product.id,
                                    index,
                                    "quantity",
                                    event.target.value,
                                  )
                                }
                              />
                              <label>
                                <input
                                  type="checkbox"
                                  checked={item.enabled}
                                  onChange={(event) =>
                                    updateColorStockField(
                                      product.id,
                                      index,
                                      "enabled",
                                      event.target.checked,
                                    )
                                  }
                                />
                                For sale
                              </label>
                            </div>
                          ))}
                          <small className="inventory-total">
                            Product total: {quantity}
                          </small>
                        </div>
                      ) : (
                        <input
                          className="stock-quantity-input"
                          aria-label={`Stock quantity for ${product.name}`}
                          type="number"
                          min="0"
                          step="1"
                          value={quantities[product.id] ?? ""}
                          onChange={(event) =>
                            setQuantities((current) => ({
                              ...current,
                              [product.id]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </td>
                    <td>
                      <span
                        className={`management-badge ${out ? "status-cancelled" : low ? "status-pending" : "status-delivered"}`}
                      >
                        {out ? "Out of stock" : low ? "Low stock" : "Available"}
                      </span>
                    </td>
                    <td>
                      <div className="management-actions stock-actions">
                        <button
                          type="button"
                          disabled={busyProduct === product.id}
                          onClick={() => updateStock(product)}
                        >
                          {busyProduct === product.id
                            ? "Saving…"
                            : "Save quantity"}
                        </button>
                        {!product.variants?.colours?.length && (
                          <button
                            type="button"
                            className="availability-action"
                            disabled={
                              busyProduct === product.id || quantity === 0
                            }
                            onClick={() => toggleAvailability(product)}
                          >
                            {product.stock?.in_stock === false
                              ? "Make available"
                              : "Disable"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default StockManagement;
