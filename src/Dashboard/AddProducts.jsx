import "./Dashboard.css";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const categories = [
  "Electronics",
  "Fashion",
  "Footwear",
  "Watches",
  "Home & Kitchen",
  "Sports & Fitness",
  "Beauty",
  "Stationery",
  "Handbags",
  "Soft Toys",
];

function AddProduct() {
  const [formData, setFormData] = useState({
    id: "",
    category: "",
    title: "",
    brand: "",

    mrp: "",
    selling_price: "",

    images: [],

    about_this_item: [""],

    features_specs: [{ key: "", value: "" }],
    style: [{ key: "", value: "" }],
    measurements: [{ key: "", value: "" }],
    materials_care: [{ key: "", value: "" }],
    item_details: [{ key: "", value: "" }],

    colours: [""],
    sizes: [""],

    in_stock: true,
    quantity: "",
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const calculateDiscount = () => {
    const mrp = Number(formData.mrp);
    const sellingPrice = Number(formData.selling_price);

    if (!mrp || !sellingPrice || sellingPrice >= mrp) {
      return 0;
    }

    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  const discount = calculateDiscount();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const remainingSlots = 5 - formData.images.length;

    const selectedFiles = files.slice(0, remainingSlots);

    const newPreviews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setImagePreviews((prev) => {
      const updated = [...prev];

      URL.revokeObjectURL(updated[index].url);

      return updated.filter((_, i) => i !== index);
    });
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.about_this_item];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      about_this_item: updated,
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      about_this_item: [...prev.about_this_item, ""],
    }));
  };

  const removeFeature = (index) => {
    if (formData.about_this_item.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      about_this_item: prev.about_this_item.filter((_, i) => i !== index),
    }));
  };

  const handleKeyValueChange = (section, index, field, value) => {
    const updated = [...formData[section]];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      [section]: updated,
    }));
  };

  const addKeyValue = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], { key: "", value: "" }],
    }));
  };

  const removeKeyValue = (section, index) => {
    if (formData[section].length === 1) return;

    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleColourChange = (index, value) => {
    const updated = [...formData.colours];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      colours: updated,
    }));
  };

  const addColour = () => {
    setFormData((prev) => ({
      ...prev,
      colours: [...prev.colours, ""],
    }));
  };

  const removeColour = (index) => {
    if (formData.colours.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      colours: prev.colours.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (index, value) => {
    const updated = [...formData.sizes];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      sizes: updated,
    }));
  };

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, ""],
    }));
  };

  const removeSize = (index) => {
    if (formData.sizes.length === 1) return;

    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = "Product ID is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.mrp || Number(formData.mrp) <= 0) {
      newErrors.mrp = "Enter a valid MRP";
    }

    if (
      !formData.selling_price ||
      Number(formData.selling_price) <= 0
    ) {
      newErrors.selling_price = "Enter a valid selling price";
    }

    if (
      Number(formData.selling_price) > 0 &&
      Number(formData.mrp) > 0 &&
      Number(formData.selling_price) >= Number(formData.mrp)
    ) {
      newErrors.selling_price =
        "Selling price must be less than MRP";
    }

    if (formData.images.length === 0) {
      newErrors.images = "Please upload at least one product image";
    }

    if (
      formData.in_stock &&
      (!formData.quantity || Number(formData.quantity) < 0)
    ) {
      newErrors.quantity = "Enter a valid stock quantity";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const convertToObject = (items) => {
    const result = {};

    items.forEach((item) => {
      if (item.key.trim()) {
        result[item.key.trim()] = item.value.trim();
      }
    });

    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("id", formData.id.trim());
      data.append("category", formData.category);
      data.append("title", formData.title.trim());
      data.append("brand", formData.brand.trim());

      data.append(
        "price",
        JSON.stringify({
          currency: "INR",
          mrp: Number(formData.mrp),
          selling_price: Number(formData.selling_price),
          discount_percent: discount,
        })
      );

      data.append(
        "about_this_item",
        JSON.stringify(
          formData.about_this_item.filter(
            (item) => item.trim() !== ""
          )
        )
      );

      data.append(
        "product_information",
        JSON.stringify({
          features_specs: convertToObject(formData.features_specs),
          style: convertToObject(formData.style),
          measurements: convertToObject(formData.measurements),
          materials_care: convertToObject(formData.materials_care),
          item_details: convertToObject(formData.item_details),
        })
      );

      data.append(
        "variants",
        JSON.stringify({
          colours: formData.colours.filter(
            (item) => item.trim() !== ""
          ),
          sizes: formData.sizes.filter(
            (item) => item.trim() !== ""
          ),
        })
      );

      data.append(
        "stock",
        JSON.stringify({
          in_stock: formData.in_stock,
          quantity: Number(formData.quantity) || 0,
        })
      );

      formData.images.forEach((image) => {
        data.append("images", image);
      });

      const response = await axios.post(
        `${API_URL}/api/products`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Product created:", response.data);

      setSuccessMessage("Product added successfully!");
      setFormData({
        id: "",
        category: "",
        title: "",
        brand: "",
        mrp: "",
        selling_price: "",
        images: [],
        about_this_item: [""],
        features_specs: [{ key: "", value: "" }],
        style: [{ key: "", value: "" }],
        measurements: [{ key: "", value: "" }],
        materials_care: [{ key: "", value: "" }],
        item_details: [{ key: "", value: "" }],
        colours: [""],
        sizes: [""],
        in_stock: true,
        quantity: "",
      });

      setImagePreviews([]);
      setErrors({});
    } catch (error) {
      console.error("Add product error:", error);

      setErrors({
        submit:
          error.response?.data?.message ||
          "Something went wrong while adding the product.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderKeyValueSection = (title, section) => {
    return (
      <section className="product-section">
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            <p>Add product information as key-value pairs.</p>
          </div>

          <button
            type="button"
            className="small-add-btn"
            onClick={() => addKeyValue(section)}
          >
            + Add
          </button>
        </div>

        <div className="key-value-list">
          {formData[section].map((item, index) => (
            <div className="key-value-row" key={index}>
              <input
                type="text"
                placeholder="Key"
                value={item.key}
                onChange={(e) =>
                  handleKeyValueChange(
                    section,
                    index,
                    "key",
                    e.target.value
                  )
                }
              />

              <input
                type="text"
                placeholder="Value"
                value={item.value}
                onChange={(e) =>
                  handleKeyValueChange(
                    section,
                    index,
                    "value",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() =>
                  removeKeyValue(section, index)
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">

        <div className="page-header">
          <div>
            <span className="page-label">PRODUCT MANAGEMENT</span>
            <h1>Add Product</h1>
            <p>
              Add a new product to your Zyora store.
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="alert error-alert">
            {errors.submit}
          </div>
        )}

        {successMessage && (
          <div className="alert success-alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>Basic Information</h2>
                <p>Enter the basic details of your product.</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Product ID <span>*</span>
                </label>

                <input
                  type="text"
                  name="id"
                  placeholder="e.g. FITX-0032-PUR"
                  value={formData.id}
                  onChange={handleChange}
                />

                {errors.id && (
                  <small className="field-error">
                    {errors.id}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <small className="field-error">
                    {errors.category}
                  </small>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  Product Title <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={handleChange}
                />

                {errors.title && (
                  <small className="field-error">
                    {errors.title}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  Brand <span>*</span>
                </label>

                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. FlexCore"
                  value={formData.brand}
                  onChange={handleChange}
                />

                {errors.brand && (
                  <small className="field-error">
                    {errors.brand}
                  </small>
                )}
              </div>

            </div>
          </section>

          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>Pricing</h2>
                <p>Set the MRP and selling price.</p>
              </div>
            </div>

            <div className="form-grid three-columns">

              <div className="form-group">
                <label>Currency</label>
                <input
                  type="text"
                  value="INR"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>
                  MRP <span>*</span>
                </label>

                <div className="price-input">
                  <span>₹</span>
                  <input
                    type="number"
                    name="mrp"
                    min="1"
                    placeholder="1799"
                    value={formData.mrp}
                    onChange={handleChange}
                  />
                </div>

                {errors.mrp && (
                  <small className="field-error">
                    {errors.mrp}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  Selling Price <span>*</span>
                </label>

                <div className="price-input">
                  <span>₹</span>
                  <input
                    type="number"
                    name="selling_price"
                    min="1"
                    placeholder="999"
                    value={formData.selling_price}
                    onChange={handleChange}
                  />
                </div>

                {errors.selling_price && (
                  <small className="field-error">
                    {errors.selling_price}
                  </small>
                )}
              </div>

            </div>

            <div className="discount-box">
              <div>
                <span>Discount</span>
                <strong>{discount}% OFF</strong>
              </div>

              <div className="discount-bar">
                <div
                  style={{
                    width: `${Math.min(discount, 100)}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>Product Images</h2>
                <p>
                  Upload up to 5 product images.
                </p>
              </div>
            </div>

            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={formData.images.length >= 5}
              />

              <div className="upload-icon">＋</div>

              <strong>
                Click to upload images
              </strong>

              <span>
                PNG, JPG or WEBP • Maximum 5 images
              </span>
            </label>

            {errors.images && (
              <small className="field-error">
                {errors.images}
              </small>
            )}

            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((image, index) => (
                  <div
                    className="image-preview"
                    key={image.url}
                  >
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                    />

                    {index === 0 && (
                      <span className="primary-image">
                        Main
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* About */}
          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>About This Item</h2>
                <p>
                  Add the main selling points of the product.
                </p>
              </div>

              <button
                type="button"
                className="small-add-btn"
                onClick={addFeature}
              >
                + Add Feature
              </button>
            </div>

            <div className="dynamic-list">
              {formData.about_this_item.map(
                (feature, index) => (
                  <div
                    className="dynamic-row"
                    key={index}
                  >
                    <span className="row-number">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      placeholder="Enter product feature"
                      value={feature}
                      onChange={(e) =>
                        handleFeatureChange(
                          index,
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeFeature(index)
                      }
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Product Information */}
          {renderKeyValueSection(
            "Features & Specifications",
            "features_specs"
          )}

          {renderKeyValueSection(
            "Style",
            "style"
          )}

          {renderKeyValueSection(
            "Measurements",
            "measurements"
          )}

          {renderKeyValueSection(
            "Materials & Care",
            "materials_care"
          )}

          {renderKeyValueSection(
            "Item Details",
            "item_details"
          )}

          {/* Variants */}
          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>Variants</h2>
                <p>
                  Add available colours and sizes.
                </p>
              </div>
            </div>

            {/* Colours */}
            <div className="variant-block">
              <div className="variant-title">
                <h3>Colours</h3>

                <button
                  type="button"
                  className="small-add-btn"
                  onClick={addColour}
                >
                  + Add Colour
                </button>
              </div>

              <div className="chips-input-list">
                {formData.colours.map(
                  (colour, index) => (
                    <div
                      className="chip-input"
                      key={index}
                    >
                      <input
                        type="text"
                        placeholder="e.g. Black"
                        value={colour}
                        onChange={(e) =>
                          handleColourChange(
                            index,
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeColour(index)
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Sizes */}
            <div className="variant-block">
              <div className="variant-title">
                <h3>Sizes</h3>

                <button
                  type="button"
                  className="small-add-btn"
                  onClick={addSize}
                >
                  + Add Size
                </button>
              </div>

              <div className="chips-input-list">
                {formData.sizes.map(
                  (size, index) => (
                    <div
                      className="chip-input"
                      key={index}
                    >
                      <input
                        type="text"
                        placeholder="e.g. Large"
                        value={size}
                        onChange={(e) =>
                          handleSizeChange(
                            index,
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSize(index)
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Stock */}
          <section className="product-section">
            <div className="section-heading">
              <div>
                <h2>Inventory</h2>
                <p>Manage product availability and stock.</p>
              </div>
            </div>

            <div className="stock-row">

              <label className="stock-toggle">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      in_stock: e.target.checked,
                    }))
                  }
                />

                <span className="toggle-slider" />

                <span>
                  Product is in stock
                </span>
              </label>

              <div className="form-group quantity-field">
                <label>Quantity</label>

                <input
                  type="number"
                  min="0"
                  name="quantity"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={!formData.in_stock}
                />

                {errors.quantity && (
                  <small className="field-error">
                    {errors.quantity}
                  </small>
                )}
              </div>

            </div>
          </section>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddProduct;