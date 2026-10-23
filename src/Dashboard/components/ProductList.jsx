import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useProducts } from "../../Context/ProductContext.jsx";
import "../styles/Management.css";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/products`;
const requestConfig = { withCredentials: true };

const INFO_SECTIONS = [
  ["features_specs", "Features & specifications"],
  ["style", "Style"],
  ["measurements", "Measurements"],
  ["materials_care", "Materials & care"],
  ["item_details", "Item details"],
];

const toKeyValueRows = (value) =>
  Object.entries(value || {}).map(([key, itemValue]) => ({
    key,
    value: String(itemValue ?? ""),
  }));

const createEditForm = (product) => {
  const colours = [...(product.variants?.colours || [])];
  const knownColours = new Set(
    colours.map((color) =>
      String(color || "")
        .trim()
        .toLowerCase(),
    ),
  );
  (product.variants?.colorStock || []).forEach((item) => {
    const color = String(item.color || "").trim();
    const key = color.toLowerCase();
    if (color && !knownColours.has(key)) {
      colours.push(color);
      knownColours.add(key);
    }
  });
  if (!colours.length) colours.push("");
  const existingColorStock = new Map(
    (product.variants?.colorStock || []).map((item) => [
      String(item.color || "")
        .trim()
        .toLowerCase(),
      item,
    ]),
  );
  const hasSavedColorStock = existingColorStock.size > 0;

  return {
    id: product.id || "",
    name: product.name || "",
    category: product.category || "",
    subcategory: product.subcategory || "",
    title: product.title || "",
    brand: product.brand || "",
    mrp: String(product.price?.mrp ?? ""),
    sellingPrice: String(product.price?.selling_price ?? ""),
    ratingAverage: String(product.rating?.average ?? 0),
    ratingCount: String(product.rating?.count ?? 0),
    quantity: String(product.stock?.quantity ?? 0),
    inStock: product.stock?.in_stock === true,
    colorQuantities: colours.map((color, index) => {
      const saved = existingColorStock.get(color.trim().toLowerCase());
      return String(
        saved?.quantity ??
          (!hasSavedColorStock && index === 0
            ? (product.stock?.quantity ?? 0)
            : 0),
      );
    }),
    colorEnabled: colours.map((color) => {
      const saved = existingColorStock.get(color.trim().toLowerCase());
      return saved
        ? saved.enabled !== false
        : product.stock?.in_stock !== false;
    }),
    isBestSeller: product.is_best_seller === true,
    images: (product.images || []).map((image) => ({
      id: image.id || "",
      url: image.url,
      color: image.color || "",
      alt: image.alt || "",
      file: null,
    })),
    videoUrl:
      typeof product.video === "string"
        ? product.video
        : product.video?.url || "",
    videoPreview:
      typeof product.video === "string"
        ? product.video
        : product.video?.url || "",
    videoFile: null,
    videoRemoved: false,
    aboutThisItem: product.about_this_item?.length
      ? [...product.about_this_item]
      : [""],
    productInformation: Object.fromEntries(
      INFO_SECTIONS.map(([key]) => [
        key,
        toKeyValueRows(product.product_information?.[key]),
      ]),
    ),
    colours,
    sizes: product.variants?.sizes?.length ? [...product.variants.sizes] : [""],
  };
};

const ProductList = ({ onAddProduct }) => {
  const { refreshProducts } = useProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyProduct, setBusyProduct] = useState("");

  const fetchProducts = useCallback(async () => {
    const response = await axios.get(`${API}/get_products`, requestConfig);
    if (!Array.isArray(response.data)) {
      throw new Error("The product service returned an invalid response.");
    }
    return response.data;
  }, []);

  const refreshList = () => {
    setLoading(true);
    setLoadError("");
    fetchProducts()
      .then(setProducts)
      .catch((error) => {
        console.error("Unable to load products:", error);
        setLoadError(
          error.response?.data?.message || "Unable to load the product list.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Unable to load products:", error);
        setLoadError(
          error.response?.data?.message || "Unable to load the product list.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      [
        product.id,
        product.name,
        product.title,
        product.brand,
        product.category,
        product.subcategory,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [products, search]);

  const openEdit = (product) => {
    setEditing({ product, form: createEditForm(product) });
  };

  const closeEdit = () => {
    editing?.form.images.forEach((image) => {
      if (image.file) URL.revokeObjectURL(image.url);
    });
    if (editing?.form.videoFile) {
      URL.revokeObjectURL(editing.form.videoPreview);
    }
    setEditing(null);
  };

  const updateForm = (event) => {
    const { name, value, checked, type } = event.target;
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [name]: type === "checkbox" ? checked : value,
        ...(name === "category" && value !== current.form.category
          ? { subcategory: "" }
          : {}),
      },
    }));
  };

  const updateListField = (field, index, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: current.form[field].map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    }));
  };

  const updateInformation = (section, index, field, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        productInformation: {
          ...current.form.productInformation,
          [section]: current.form.productInformation[section].map(
            (item, itemIndex) =>
              itemIndex === index ? { ...item, [field]: value } : item,
          ),
        },
      },
    }));
  };

  const addInformationRow = (section) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        productInformation: {
          ...current.form.productInformation,
          [section]: [
            ...current.form.productInformation[section],
            { key: "", value: "" },
          ],
        },
      },
    }));
  };

  const removeInformationRow = (section, index) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        productInformation: {
          ...current.form.productInformation,
          [section]: current.form.productInformation[section].filter(
            (_, itemIndex) => itemIndex !== index,
          ),
        },
      },
    }));
  };

  const addListField = (field, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: [...current.form[field], value],
        ...(field === "colours" && {
          colorQuantities: [...current.form.colorQuantities, ""],
          colorEnabled: [...current.form.colorEnabled, current.form.inStock],
        }),
      },
    }));
  };

  const removeListField = (field, index) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: current.form[field].filter(
          (_, itemIndex) => itemIndex !== index,
        ),
        ...(field === "colours" && {
          colorQuantities: current.form.colorQuantities.filter(
            (_, itemIndex) => itemIndex !== index,
          ),
          colorEnabled: current.form.colorEnabled.filter(
            (_, itemIndex) => itemIndex !== index,
          ),
        }),
      },
    }));
  };

  const updateColorStock = (index, field, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        [field]: current.form[field].map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    }));
  };

  const addImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const availableSlots = Math.max(0, 4 - editing.form.images.length);
    const selectedFiles = files.slice(0, availableSlots);
    if (selectedFiles.length < files.length) {
      toast.error("A product can have up to four images.");
    }

    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        images: [
          ...current.form.images,
          ...selectedFiles.map((file, index) => ({
            id: `img-${current.form.images.length + index + 1}`,
            url: URL.createObjectURL(file),
            color: "",
            alt: `${current.form.name.trim() || "Product"} image ${
              current.form.images.length + index + 1
            }`,
            file,
          })),
        ],
      },
    }));
    event.target.value = "";
  };

  const updateVideo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
      toast.error("Choose an MP4, WebM, or Ogg video.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("The video must be 100 MB or smaller.");
      return;
    }

    const preview = URL.createObjectURL(file);
    if (editing.form.videoFile) {
      URL.revokeObjectURL(editing.form.videoPreview);
    }
    setEditing((current) => {
      return {
        ...current,
        form: {
          ...current.form,
          videoUrl: "",
          videoPreview: preview,
          videoFile: file,
          videoRemoved: false,
        },
      };
    });
  };

  const removeVideo = () => {
    if (editing.form.videoFile) {
      URL.revokeObjectURL(editing.form.videoPreview);
    }
    setEditing((current) => {
      return {
        ...current,
        form: {
          ...current.form,
          videoUrl: "",
          videoPreview: "",
          videoFile: null,
          videoRemoved: true,
        },
      };
    });
  };

  const removeImage = (index) => {
    const image = editing.form.images[index];
    if (image.file) URL.revokeObjectURL(image.url);
    removeListField("images", index);
  };

  const updateImage = (index, field, value) => {
    setEditing((current) => ({
      ...current,
      form: {
        ...current.form,
        images: current.form.images.map((image, itemIndex) =>
          itemIndex === index ? { ...image, [field]: value } : image,
        ),
      },
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const form = editing.form;
    const mrp = Number(form.mrp);
    const sellingPrice = Number(form.sellingPrice);
    const quantity = Number(form.quantity);

    if (
      !form.id.trim() ||
      !form.name.trim() ||
      !form.category.trim() ||
      !form.title.trim() ||
      !form.brand.trim()
    ) {
      toast.error("Complete all required product details.");
      return;
    }
    if (
      !Number.isFinite(mrp) ||
      !Number.isFinite(sellingPrice) ||
      mrp <= 0 ||
      sellingPrice <= 0 ||
      sellingPrice >= mrp
    ) {
      toast.error("Selling price must be positive and less than MRP.");
      return;
    }
    const colors = form.colours.map((color) => color.trim());
    const hasColorVariants = colors.some(Boolean);
    if (!hasColorVariants && (!Number.isInteger(quantity) || quantity < 0)) {
      toast.error("Stock quantity must be a non-negative whole number.");
      return;
    }
    if (
      (hasColorVariants && colors.some((color) => !color)) ||
      colors.length > form.images.length
    ) {
      toast.error(
        "Complete each colour and keep one image per colour variant.",
      );
      return;
    }
    const colorStock = colors.map((color, index) => {
      if (!color) return null;
      const colorQuantity = Number(form.colorQuantities[index]);
      if (
        form.colorQuantities[index] === "" ||
        !Number.isInteger(colorQuantity) ||
        colorQuantity < 0
      ) {
        return false;
      }
      return {
        color,
        quantity: colorQuantity,
        enabled: form.colorEnabled[index] !== false,
      };
    });
    if (colorStock.includes(false)) {
      toast.error(
        "Enter a non-negative whole-number quantity for every colour.",
      );
      return;
    }
    const savedColorStock = colorStock.filter(Boolean);
    const totalQuantity = savedColorStock.length
      ? savedColorStock.reduce((total, item) => total + item.quantity, 0)
      : quantity;
    const anyAvailable = savedColorStock.length
      ? savedColorStock.some((item) => item.enabled && item.quantity > 0)
      : form.inStock && totalQuantity > 0;
    const ratingAverage = Number(form.ratingAverage);
    const ratingCount = Number(form.ratingCount);
    if (
      !Number.isFinite(ratingAverage) ||
      ratingAverage < 0 ||
      ratingAverage > 5 ||
      !Number.isInteger(ratingCount) ||
      ratingCount < 0 ||
      (ratingCount === 0) !== (ratingAverage === 0)
    ) {
      toast.error(
        "Rating must be between 0 and 5 with a whole-number review count.",
      );
      return;
    }
    if (form.images.length === 0) {
      toast.error("A product must have at least one image.");
      return;
    }
    if (form.images.length > 4) {
      toast.error("A product can have up to four images.");
      return;
    }

    const productId = editing.product.id;
    try {
      setSaving(true);
      const data = new FormData();
      data.append("id", form.id.trim());
      data.append("name", form.name.trim());
      data.append("category", form.category.trim());
      data.append("subcategory", form.subcategory.trim());
      data.append("title", form.title.trim());
      data.append("brand", form.brand.trim());
      data.append(
        "price",
        JSON.stringify({
          currency: editing.product.price?.currency || "INR",
          mrp,
          selling_price: sellingPrice,
        }),
      );
      data.append(
        "rating",
        JSON.stringify({ average: ratingAverage, count: ratingCount }),
      );
      data.append(
        "stock",
        JSON.stringify({ quantity: totalQuantity, in_stock: anyAvailable }),
      );
      data.append("is_best_seller", String(form.isBestSeller));
      data.append(
        "about_this_item",
        JSON.stringify(
          form.aboutThisItem.map((item) => item.trim()).filter(Boolean),
        ),
      );
      data.append(
        "product_information",
        JSON.stringify(
          Object.fromEntries(
            INFO_SECTIONS.map(([section]) => [
              section,
              Object.fromEntries(
                form.productInformation[section]
                  .filter((item) => item.key.trim())
                  .map((item) => [item.key.trim(), item.value.trim()]),
              ),
            ]),
          ),
        ),
      );
      data.append(
        "variants",
        JSON.stringify({
          colours: colors.filter(Boolean),
          colorStock: savedColorStock,
          sizes: form.sizes.map((item) => item.trim()).filter(Boolean),
        }),
      );
      data.append(
        "existing_images",
        JSON.stringify(
          form.images
            .filter((image) => !image.file)
            .map(({ id, url, color, alt }) => ({ id, url, color, alt })),
        ),
      );
      const uploadedImages = form.images.filter((image) => image.file);
      uploadedImages.forEach((image) => data.append("images", image.file));
      data.append(
        "image_metadata",
        JSON.stringify(
          uploadedImages.map(({ id, color, alt }) => ({ id, color, alt })),
        ),
      );
      if (form.videoFile) {
        data.append("video", form.videoFile);
      }
      data.append("remove_video", String(form.videoRemoved));

      const response = await axios.patch(
        `${API}/${encodeURIComponent(productId)}`,
        data,
        {
          ...requestConfig,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? response.data.product : product,
        ),
      );
      form.images.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.url);
      });
      if (form.videoFile) URL.revokeObjectURL(form.videoPreview);
      setEditing(null);
      toast.success(response.data.message || "Product updated successfully.");
      if (!(await refreshProducts())) {
        toast.error(
          "Product saved, but storefront data could not be refreshed.",
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (
      !window.confirm(`Delete "${product.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      setBusyProduct(product.id);
      const response = await axios.delete(
        `${API}/${encodeURIComponent(product.id)}`,
        requestConfig,
      );
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      toast.success(response.data.message || "Product deleted successfully.");
      if (!(await refreshProducts())) {
        toast.error(
          "Product deleted, but storefront data could not be refreshed.",
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete product.");
    } finally {
      setBusyProduct("");
    }
  };

  return (
    <main className="management-page product-list-page">
      <header className="management-heading">
        <div>
          <span className="management-eyebrow">PRODUCT MANAGEMENT</span>
          <h1>Products</h1>
          <p>Browse, update, and remove products in your store.</p>
        </div>
        <div className="product-list-heading-actions">
          <button
            className="management-refresh"
            onClick={refreshList}
            type="button"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            className="product-list-add"
            onClick={onAddProduct}
            type="button"
          >
            + Add product
          </button>
        </div>
      </header>

      <section className="management-stats" aria-label="Product summary">
        <article>
          <span>Total products</span>
          <strong>{products.length}</strong>
        </article>
        <article>
          <span>Available</span>
          <strong>
            {
              products.filter(
                (product) =>
                  product.stock?.in_stock === true &&
                  Number(product.stock?.quantity) > 0,
              ).length
            }
          </strong>
        </article>
        <article>
          <span>Out of stock</span>
          <strong>
            {
              products.filter(
                (product) =>
                  product.stock?.in_stock !== true ||
                  Number(product.stock?.quantity) <= 0,
              ).length
            }
          </strong>
        </article>
      </section>

      <div className="management-toolbar">
        <input
          aria-label="Search products"
          placeholder="Search name, SKU, brand, or category"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="management-empty" role="status">
          Loading products…
        </p>
      ) : loadError ? (
        <div className="management-empty" role="alert">
          <p>{loadError}</p>
          <button
            className="management-refresh"
            onClick={refreshList}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="management-empty">
          {products.length
            ? "No products match your search."
            : "No products have been added yet."}
        </p>
      ) : (
        <div className="management-table-wrap">
          <table className="management-table product-list-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const quantity = Number(product.stock?.quantity) || 0;
                const available =
                  product.stock?.in_stock === true && quantity > 0;
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
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.brand}</small>
                        </div>
                      </div>
                    </td>
                    <td>{product.id}</td>
                    <td>
                      <strong>{product.category}</strong>
                      {product.subcategory && (
                        <small>{product.subcategory}</small>
                      )}
                    </td>
                    <td>
                      <strong>₹{product.price?.selling_price ?? "—"}</strong>
                      {product.price?.mrp ? (
                        <small className="product-list-mrp">
                          MRP ₹{product.price.mrp}
                        </small>
                      ) : null}
                    </td>
                    <td>{quantity}</td>
                    <td>
                      <span
                        className={`management-badge ${
                          available ? "status-delivered" : "status-cancelled"
                        }`}
                      >
                        {available ? "Available" : "Out of stock"}
                      </span>
                    </td>
                    <td>
                      <div className="management-actions product-list-actions">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          disabled={busyProduct === product.id}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-action"
                          type="button"
                          onClick={() => deleteProduct(product)}
                          disabled={busyProduct === product.id}
                        >
                          {busyProduct === product.id ? "Deleting…" : "Delete"}
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

      {editing && (
        <div
          className="management-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeEdit();
            }
          }}
        >
          <form className="management-modal" onSubmit={saveProduct}>
            <div className="management-modal-heading">
              <div>
                <span className="management-eyebrow">EDIT PRODUCT</span>
                <h2>{editing.product.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Close edit product form"
                onClick={closeEdit}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="management-form-grid">
              <label>
                Product ID / SKU
                <input
                  name="id"
                  value={editing.form.id}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Product name
                <input
                  name="name"
                  value={editing.form.name}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Category
                <input
                  name="category"
                  value={editing.form.category}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Subcategory
                <input
                  name="subcategory"
                  value={editing.form.subcategory}
                  onChange={updateForm}
                />
              </label>
              <label>
                Description
                <input
                  name="title"
                  value={editing.form.title}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Brand
                <input
                  name="brand"
                  value={editing.form.brand}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                MRP (₹)
                <input
                  name="mrp"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editing.form.mrp}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Selling price (₹)
                <input
                  name="sellingPrice"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editing.form.sellingPrice}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Average rating (0–5)
                <input
                  name="ratingAverage"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editing.form.ratingAverage}
                  onChange={updateForm}
                  required
                />
              </label>
              <label>
                Review count
                <input
                  name="ratingCount"
                  type="number"
                  min="0"
                  step="1"
                  value={editing.form.ratingCount}
                  onChange={updateForm}
                  required
                />
              </label>
              {!editing.form.colours.some((color) => color.trim()) && (
                <>
                  <label>
                    Stock quantity
                    <input
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={editing.form.quantity}
                      onChange={updateForm}
                      required
                    />
                  </label>
                  <label className="product-list-checkbox">
                    <input
                      name="inStock"
                      type="checkbox"
                      checked={editing.form.inStock}
                      onChange={updateForm}
                    />
                    Available for sale
                  </label>
                </>
              )}
              <label className="product-list-checkbox">
                <input
                  name="isBestSeller"
                  type="checkbox"
                  checked={editing.form.isBestSeller}
                  onChange={updateForm}
                />
                Best seller
              </label>
            </div>

            <section className="product-edit-section">
              <div className="product-edit-section-heading">
                <div>
                  <h3>Product images</h3>
                  <p>Keep, remove, or add up to four images.</p>
                </div>
                <label className="product-image-add">
                  Add images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={addImages}
                    disabled={editing.form.images.length >= 4}
                  />
                </label>
              </div>
              {editing.form.images.map((image, index) => (
                <div
                  className="product-edit-image"
                  key={`${image.id}-${index}`}
                >
                  <img src={image.url} alt={image.alt || ""} />
                  <label>
                    Colour
                    <input
                      value={image.color}
                      onChange={(event) =>
                        updateImage(index, "color", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Alt text
                    <input
                      value={image.alt}
                      onChange={(event) =>
                        updateImage(index, "alt", event.target.value)
                      }
                    />
                  </label>
                  {editing.form.colours[index]?.trim() && (
                    <div className="product-edit-variant-stock">
                      <label>
                        {editing.form.colours[index]} quantity
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editing.form.colorQuantities[index] ?? ""}
                          onChange={(event) =>
                            updateColorStock(
                              index,
                              "colorQuantities",
                              event.target.value,
                            )
                          }
                          required
                        />
                      </label>
                      <label className="product-list-checkbox">
                        <input
                          type="checkbox"
                          checked={editing.form.colorEnabled[index] !== false}
                          onChange={(event) =>
                            updateColorStock(
                              index,
                              "colorEnabled",
                              event.target.checked,
                            )
                          }
                        />
                        Available
                      </label>
                    </div>
                  )}
                  <button
                    className="product-image-remove"
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>

            <section className="product-edit-section">
              <div className="product-edit-section-heading">
                <div>
                  <h3>Product video</h3>
                  <p>Upload one MP4, WebM, or Ogg video (maximum 100 MB).</p>
                </div>
                <label className="product-image-add">
                  {editing.form.videoPreview ? "Replace video" : "Add video"}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={updateVideo}
                  />
                </label>
              </div>
              {editing.form.videoPreview && (
                <div className="product-edit-video">
                  <video
                    src={editing.form.videoPreview}
                    controls
                    preload="metadata"
                  />
                  <button
                    className="product-image-remove"
                    type="button"
                    onClick={removeVideo}
                  >
                    Remove video
                  </button>
                </div>
              )}
            </section>

            <section className="product-edit-section">
              <div className="product-edit-section-heading">
                <div>
                  <h3>About this item</h3>
                  <p>Add or update the product highlights.</p>
                </div>
                <button
                  className="product-edit-add-row"
                  type="button"
                  onClick={() => addListField("aboutThisItem", "")}
                >
                  + Add detail
                </button>
              </div>
              {editing.form.aboutThisItem.map((item, index) => (
                <div className="product-edit-list-row" key={`about-${index}`}>
                  <textarea
                    aria-label={`About this item ${index + 1}`}
                    value={item}
                    onChange={(event) =>
                      updateListField(
                        "aboutThisItem",
                        index,
                        event.target.value,
                      )
                    }
                    rows={2}
                  />
                  <button
                    className="product-image-remove"
                    type="button"
                    onClick={() => removeListField("aboutThisItem", index)}
                    aria-label={`Remove detail ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>

            {INFO_SECTIONS.map(([section, label]) => (
              <section className="product-edit-section" key={section}>
                <div className="product-edit-section-heading">
                  <div>
                    <h3>{label}</h3>
                  </div>
                  <button
                    className="product-edit-add-row"
                    type="button"
                    onClick={() => addInformationRow(section)}
                  >
                    + Add row
                  </button>
                </div>
                {editing.form.productInformation[section].map((item, index) => (
                  <div
                    className="product-edit-information-row"
                    key={`${section}-${index}`}
                  >
                    <input
                      aria-label={`${label} field name ${index + 1}`}
                      placeholder="Field name"
                      value={item.key}
                      onChange={(event) =>
                        updateInformation(
                          section,
                          index,
                          "key",
                          event.target.value,
                        )
                      }
                    />
                    <input
                      aria-label={`${label} value ${index + 1}`}
                      placeholder="Value"
                      value={item.value}
                      onChange={(event) =>
                        updateInformation(
                          section,
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                    />
                    <button
                      className="product-image-remove"
                      type="button"
                      onClick={() => removeInformationRow(section, index)}
                      aria-label={`Remove ${label} row ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </section>
            ))}

            {[
              ["colours", "Colour variants"],
              ["sizes", "Size variants"],
            ].map(([field, label]) => (
              <section className="product-edit-section" key={field}>
                <div className="product-edit-section-heading">
                  <div>
                    <h3>{label}</h3>
                  </div>
                  <button
                    className="product-edit-add-row"
                    type="button"
                    onClick={() => addListField(field, "")}
                  >
                    + Add option
                  </button>
                </div>
                {editing.form[field].map((value, index) => (
                  <div
                    className="product-edit-list-row"
                    key={`${field}-${index}`}
                  >
                    <input
                      aria-label={`${label} ${index + 1}`}
                      value={value}
                      onChange={(event) =>
                        updateListField(field, index, event.target.value)
                      }
                    />
                    <button
                      className="product-image-remove"
                      type="button"
                      onClick={() => removeListField(field, index)}
                      aria-label={`Remove ${label} ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </section>
            ))}

            <div className="management-modal-actions">
              <button
                className="management-secondary"
                type="button"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="management-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default ProductList;
