import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/products/admin/inventory`;

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [quantities, setQuantities] = useState({});
  const [busyProduct, setBusyProduct] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(API, { withCredentials: true });
      const list = response.data.products || [];
      setProducts(list);
      setQuantities(
        Object.fromEntries(
          list.map((product) => [product.id, String(product.stock?.quantity ?? 0)]),
        ),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const quantity = Number(product.stock?.quantity) || 0;
      const status = !product.stock?.in_stock || quantity === 0
        ? "out"
        : quantity <= 5 ? "low" : "available";
      const matchesSearch =
        !query ||
        [product.id, product.name, product.brand, product.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesSearch && (filter === "all" || status === filter);
    });
  }, [products, search, filter]);

  const updateStock = async (product) => {
    const quantity = Number(quantities[product.id]);
    if (!Number.isInteger(quantity) || quantity < 0) {
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
        current.map((item) => item.id === product.id ? response.data.product : item),
      );
      setQuantities((current) => ({
        ...current,
        [product.id]: String(response.data.product.stock.quantity),
      }));
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
        current.map((item) => item.id === product.id ? response.data.product : item),
      );
      toast.success(next ? "Product marked available" : "Product marked unavailable");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update availability");
    } finally {
      setBusyProduct("");
    }
  };

  const availableCount = products.filter((product) =>
    product.stock?.in_stock && Number(product.stock?.quantity) > 5,
  ).length;
  const lowCount = products.filter((product) =>
    product.stock?.in_stock && Number(product.stock?.quantity) > 0 && Number(product.stock?.quantity) <= 5,
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
        <button className="management-refresh" onClick={fetchProducts} type="button">Refresh</button>
      </header>

      <section className="management-stats" aria-label="Inventory summary">
        <article><span>Products</span><strong>{products.length}</strong></article>
        <article><span>Healthy stock</span><strong>{availableCount}</strong></article>
        <article><span>Low stock (1–5)</span><strong>{lowCount}</strong></article>
        <article><span>Out of stock</span><strong>{outCount}</strong></article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search products"
          placeholder="Search product, brand, or SKU"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filter inventory" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">All products</option>
          <option value="available">Healthy stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <p className="management-empty">Loading inventory…</p>
      ) : filteredProducts.length === 0 ? (
        <p className="management-empty">{products.length ? "No products match your filters." : "No products are available to manage."}</p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table stock-table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>Quantity</th><th>Availability</th><th>Actions</th></tr>
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
                        {image ? <img src={image} alt="" /> : <span className="stock-product-placeholder">ZY</span>}
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>{product.id}</td>
                    <td>{product.category || "—"}</td>
                    <td>
                      <input
                        className="stock-quantity-input"
                        aria-label={`Stock quantity for ${product.name}`}
                        type="number"
                        min="0"
                        step="1"
                        value={quantities[product.id] ?? ""}
                        onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))}
                      />
                    </td>
                    <td><span className={`management-badge ${out ? "status-cancelled" : low ? "status-pending" : "status-delivered"}`}>{out ? "Out of stock" : low ? "Low stock" : "Available"}</span></td>
                    <td>
                      <div className="management-actions stock-actions">
                        <button type="button" disabled={busyProduct === product.id} onClick={() => updateStock(product)}>
                          {busyProduct === product.id ? "Saving…" : "Save quantity"}
                        </button>
                        <button
                          type="button"
                          className="availability-action"
                          disabled={busyProduct === product.id || quantity === 0}
                          onClick={() => toggleAvailability(product)}
                        >
                          {product.stock?.in_stock === false ? "Make available" : "Disable"}
                        </button>
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
