import "./Cart.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HiOutlineTrash } from "react-icons/hi2";
import { useCart } from "../../Context/CartContext.jsx";
import Confetti from "../../Confetti/Confetti.jsx";
import nocart from "../../assets/Videos/nocart.gif";
import { MdKeyboardArrowRight } from "react-icons/md";
import CouponPopup from "./CouponPopup.jsx";
import { BiSolidOffer } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useProducts } from "../../Context/ProductContext.jsx";

const API = import.meta.env.VITE_API_BASE_URL;

const PRICING_FIELDS = ["freeShippingLimit", "shippingCharge", "platformFee"];

const getStoredAddresses = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("addresses") || "null");
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch (error) {
    console.error("Unable to parse saved addresses", error);
  }

  try {
    const def = JSON.parse(localStorage.getItem("defaultAddress") || "null");
    return def ? [def] : [];
  } catch (error) {
    console.error("Unable to parse default address", error);
    return [];
  }
};

const persistAddresses = (list) => {
  try {
    const def = list.find((a) => a.isDefault);
    if (def) localStorage.setItem("defaultAddress", JSON.stringify(def));
    else localStorage.removeItem("defaultAddress");
    localStorage.setItem("addresses", JSON.stringify(list));
  } catch (error) {
    console.error("Unable to save addresses", error);
  }
};

const couponLabel = (coupon) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}% discount applied.`
    : `₹${coupon.discountValue} discount applied.`;

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    updateCartItemOption,
    isCartSyncing,
  } = useCart();

  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isLoggedIn } = useAuth();
  const { refreshProducts } = useProducts();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState("");
  const [pricingRetry, setPricingRetry] = useState(0);

  const [selectedCartIds, setSelectedCartIds] = useState(
    () => new Set(cartItems.map((item) => item.cartId)),
  );

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState("");

  const [showPlatformFee, setShowPlatformFee] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPricing = async () => {
      setPricingLoading(true);
      setPricingError("");

      try {
        const response = await axios.get(`${API}/api/config/pricing`);
        const result = response.data?.pricing;

        if (
          !response.data?.success ||
          !result ||
          !PRICING_FIELDS.every(
            (field) =>
              Number.isFinite(Number(result[field])) &&
              Number(result[field]) >= 0,
          )
        ) {
          throw new Error(
            response.data?.message || "Invalid pricing settings response",
          );
        }

        if (!cancelled) {
          setPricing(
            Object.fromEntries(
              PRICING_FIELDS.map((field) => [field, Number(result[field])]),
            ),
          );
        }
      } catch (error) {
        console.error("Get pricing error:", error);
        if (!cancelled) {
          setPricing(null);
          setPricingError(
            "Unable to load shipping and fee settings. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    };

    loadPricing();

    return () => {
      cancelled = true;
    };
  }, [pricingRetry]);

  // Address state
  const [addresses, setAddresses] = useState(() => getStoredAddresses());
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(() => {
    const defaultIndex = addresses.findIndex((address) => address.isDefault);
    return defaultIndex >= 0 ? defaultIndex : 0;
  });

  // Keep selected cart items synchronized with cartItems
  useEffect(() => {
    setSelectedCartIds((currentIds) => {
      const cartItemIds = new Set(cartItems.map((item) => item.cartId));
      const nextIds = new Set(
        [...currentIds].filter((cartId) => cartItemIds.has(cartId)),
      );

      cartItems.forEach((item) => {
        if (!currentIds.has(item.cartId)) nextIds.add(item.cartId);
      });

      return nextIds;
    });
  }, [cartItems]);

  // Fetch available coupons once on mount so the offers count is correct
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setCouponsLoading(true);
      setCouponsError("");
      try {
        const res = await axios.get(`${API}/api/coupons`, {
          withCredentials: true,
        });
        if (!cancelled && res.data.success) {
          setAvailableCoupons(res.data.coupons || []);
        }
      } catch (error) {
        console.error("Get coupons error:", error);
        if (!cancelled) setCouponsError("Unable to load coupons right now.");
      } finally {
        if (!cancelled) setCouponsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedItems = cartItems.filter((item) =>
    selectedCartIds.has(item.cartId),
  );

  const subtotal = selectedItems.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  const freeShippingLimit = pricing?.freeShippingLimit ?? 0;
  const shipping =
    !pricing || subtotal === 0 || subtotal >= freeShippingLimit
      ? 0
      : pricing.shippingCharge;

  const totalMRP = selectedItems.reduce(
    (sum, item) => sum + (Number(item.mrp) || 0) * (Number(item.quantity) || 0),
    0,
  );

  const productDiscount = selectedItems.reduce((sum, item) => {
    const mrp = Number(item.mrp) || 0;
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + Math.max(0, mrp - price) * qty;
  }, 0);

  const couponDiscount = appliedCoupon?.discountAmount || 0;

  const totalItemsCount = selectedItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );

  const total = Math.max(
    0,
    subtotal +
      shipping -
      couponDiscount +
      (selectedItems.length > 0 ? (pricing?.platformFee ?? 0) : 0),
  );

  const toggleCartItem = (cartId) => {
    setSelectedCartIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(cartId)) nextIds.delete(cartId);
      else nextIds.add(cartId);
      return nextIds;
    });
  };

  const openCartProduct = (item) => {
    const productId = item.productId ?? item.id;

    if (!productId) {
      console.error("Product ID missing from cart item:", item);
      return;
    }

    const slug = (item.name || item.title)
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    navigate(`/Zyora_Category/product/${productId}/${slug}`, {
      state: { selectedImage: item.image },
    });
  };

  // ---------- Addresses ----------
  const handleDeleteAddress = (addressIndex) => {
    const next = addresses.filter((_, i) => i !== addressIndex);

    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }

    setAddresses(next);
    persistAddresses(next);
    const defaultIndex = next.findIndex((address) => address.isDefault);
    setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);
  };

  // ---------- Coupons ----------
  // Always validated against subtotal, so apply and revalidation agree
  const applyCoupon = async (rawCode) => {
    const code = (rawCode || "").trim().toUpperCase();

    setCouponMessage("");

    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return false;
    }

    if (subtotal <= 0) {
      setCouponMessage("Add items to your cart before applying a coupon.");
      return false;
    }

    try {
      setCouponLoading(true);

      const response = await axios.post(
        `${API}/api/coupons/apply`,
        { code, cartTotal: subtotal },
        { withCredentials: true },
      );

      if (response.data.success) {
        const coupon = response.data.coupon;

        setAppliedCoupon({
          ...coupon,
          discountAmount: Number(response.data.discountAmount) || 0,
          finalAmount: Number(response.data.finalAmount) || 0,
        });
        setCouponCode(coupon.code);
        setCouponMessage(couponLabel(coupon));
        setShowCouponInput(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Apply coupon error:", error);
      setAppliedCoupon(null);
      setCouponMessage(
        error.response?.data?.message ||
          "Unable to apply coupon. Please try again.",
      );
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = () => applyCoupon(couponCode);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setShowCouponInput(false);
  };

  // Revalidate the applied coupon whenever the subtotal changes
  useEffect(() => {
    if (!appliedCoupon?.code) return;

    if (subtotal <= 0) {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponMessage("");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await axios.post(
          `${API}/api/coupons/apply`,
          { code: appliedCoupon.code, cartTotal: subtotal },
          { withCredentials: true },
        );

        if (cancelled) return;

        if (response.data.success) {
          setAppliedCoupon({
            ...response.data.coupon,
            discountAmount: Number(response.data.discountAmount) || 0,
            finalAmount: Number(response.data.finalAmount) || 0,
          });
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Coupon revalidation error:", error);
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMessage(
          error.response?.data?.message ||
            "Coupon is no longer valid for this cart.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // ---------- Free shipping celebration ----------
  const [celebrate, setCelebrate] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const celebrateTimerRef = useRef(null);
  const wasFreeShippingRef = useRef(
    Boolean(pricing && subtotal >= freeShippingLimit && subtotal > 0),
  );

  useEffect(() => {
    const isFreeShippingNow =
      Boolean(pricing) && subtotal >= freeShippingLimit && subtotal > 0;

    if (isFreeShippingNow && !wasFreeShippingRef.current) {
      setBurstKey((k) => k + 1);
      setCelebrate(true);
      clearTimeout(celebrateTimerRef.current);
      celebrateTimerRef.current = setTimeout(() => setCelebrate(false), 2800);
    }

    wasFreeShippingRef.current = isFreeShippingNow;
  }, [freeShippingLimit, pricing, subtotal]);

  useEffect(() => () => clearTimeout(celebrateTimerRef.current), []);

  // ---------- Place order ----------
  const handlePlaceOrder = async () => {
    if (placingOrder) return;
    if (!pricing) {
      toast.error(
        "Shipping and fee settings are unavailable. Please try again.",
      );
      return;
    }

    if (!isLoggedIn) {
      toast("Please sign in to place your order");
      navigate("/Login", { state: { from: location } });
      return;
    }

    const address = addresses[selectedAddressIndex];
    if (!address) {
      navigate(
        customer?.customerId
          ? `/Profile/${customer.customerId}?tab=addresses`
          : "/Login",
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const res = await axios.post(
        `${API}/api/orders`,
        {
          items: selectedItems.map((item) => ({
            productId: item.productId ?? item.id, // the product's id, e.g. ZYR-PRD-FASHION-105257
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          shippingAddress: address,
          couponCode: appliedCoupon?.code || null,
          paymentMethod: "cod",
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        selectedItems.forEach((item) => removeFromCart(item.cartId));
        toast.success(`Order placed! #${res.data.order.orderId}`);
        const productsRefreshed = await refreshProducts();
        if (!productsRefreshed) {
          toast.error(
            "Order placed, but stock could not be refreshed. Reload before shopping again.",
          );
        }
        navigate("/Payment_result", { state: { order: res.data.order } });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        const productsRefreshed = await refreshProducts();
        if (!productsRefreshed) {
          toast.error("Unable to refresh stock. Please reload the page.");
        }
      }
      toast.error(error.response?.data?.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="cart">
      <div id="page_path">
        <p>
          Home <MdKeyboardArrowRight /> Cart
        </p>
      </div>

      {cartItems.length > 0 && (
        <>
          <h1 className="cart_title">
            Your <span>Cart</span>
          </h1>

          <p>You’ve got taste, and honestly, we’re impressed.</p>
        </>
      )}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <img src={nocart} alt="" />

          <h2>Your cart is empty</h2>

          <p>
            Looks like you haven’t added anything yet. Explore our best picks
            and fill your cart with something you’ll love.
          </p>
        </div>
      ) : (
        <section className="cart_section">
          <div className="cart_left_section">
            {cartItems.map((item) => (
              <div className="cart_item" key={item.cartId}>
                <input
                  className="cart_item_checkbox"
                  type="checkbox"
                  checked={selectedCartIds.has(item.cartId)}
                  onChange={() => toggleCartItem(item.cartId)}
                  aria-label={`Include ${item.name} in price details`}
                />

                <button
                  type="button"
                  className="cart_product_image_button"
                  onClick={() => openCartProduct(item)}
                  aria-label={`View ${item.name}`}
                >
                  <img src={item.image} alt="" />
                </button>

                <div>
                  <div className="cart_item_details">
                    <span>{item.brand}</span>

                    <h2>{item.name}</h2>

                    {item.title && item.title !== item.name && (
                      <p>{item.title}</p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "50px",
                      }}
                    >
                      <label className="cart_option">
                        <span>Size:</span>

                        {item.sizes?.length > 0 ? (
                          <select
                            value={item.size}
                            disabled={isCartSyncing}
                            onChange={(event) =>
                              updateCartItemOption(
                                item.cartId,
                                "size",
                                event.target.value,
                              )
                            }
                          >
                            {item.sizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.size
                        )}
                      </label>

                      <label className="cart_option">
                        <span>Color:</span>

                        {item.colors?.length > 0 ? (
                          <select
                            value={item.color}
                            disabled={isCartSyncing}
                            onChange={(event) =>
                              updateCartItemOption(
                                item.cartId,
                                "color",
                                event.target.value,
                              )
                            }
                          >
                            {item.colors.map((color) => (
                              <option key={color} value={color}>
                                {color}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.color
                        )}
                      </label>
                    </div>

                    <h3 className="cart_item_price">
                      <span className="cart_current_price">
                        <i className="bi bi-currency-rupee"></i>
                        {Number(item.price).toLocaleString("en-IN")}
                      </span>

                      <span className="cart_mrp_price">
                        <i className="bi bi-currency-rupee"></i>
                        {Number(item.mrp).toLocaleString("en-IN")}
                      </span>

                      <span className="cart_discount_badge">
                        {item.discountPercent}% OFF
                      </span>
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      marginTop: "20px",
                    }}
                  >
                    <div className="cart_quantity">
                      <button
                        type="button"
                        disabled={isCartSyncing}
                        onClick={() => decreaseQuantity(item.cartId)}
                        aria-label="Decrease quantity"
                      >
                        <i className="bi bi-dash"></i>
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        disabled={isCartSyncing}
                        onClick={() => increaseQuantity(item.cartId)}
                        aria-label="Increase quantity"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart_trash"
                      disabled={isCartSyncing}
                      onClick={() => removeFromCart(item.cartId)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <HiOutlineTrash />
                    </button>

                    <button
                      type="button"
                      className="cart_move_to_favourites"
                    >
                      <i className="bi bi-heart" aria-hidden="true"></i>
                      <span>Move to favourites</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart_summary_list">
            <div className="offers_coupons">
              <h1>OFFERS & COUPONS</h1>
              <button
                type="button"
                className="offers_button"
                onClick={() => setShowCouponPopup(true)}
              >
                <span className="offers_icon">♧</span>
                <span>{availableCoupons.length} Offers On Your Bag</span>
                <span className="offers_arrow">›</span>
              </button>

              {appliedCoupon && (
                <div className="applied_coupon">
                  <div className="applied_coupon_icon">
                    <BiSolidOffer />
                  </div>

                  <div className="applied_coupon_details">
                    <strong>1 Coupon applied</strong>

                    <span>
                      You saved additionally ₹
                      {Number(appliedCoupon.discountAmount).toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="coupon_edit_button"
                    onClick={() => setShowCouponPopup(true)}
                  >
                    EDIT
                  </button>
                </div>
              )}
            </div>

            <aside className="cart_summary">
              <h2 className="price_details_title">
                PRICE DETAILS ({totalItemsCount}{" "}
                {totalItemsCount === 1 ? "Item" : "Items"})
              </h2>

              <div className="summary_row">
                <span>Total MRP</span>

                <strong>
                  <i className="bi bi-currency-rupee"></i>
                  {totalMRP.toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="summary_row">
                <span>Discount on MRP</span>

                <strong className={productDiscount > 0 ? "discount" : ""}>
                  {productDiscount > 0 ? (
                    <>
                      - <i className="bi bi-currency-rupee"></i>
                      {productDiscount.toLocaleString("en-IN")}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-currency-rupee"></i>0
                    </>
                  )}
                </strong>
              </div>

              <div className="summary_row">
                <span>Coupon Discount</span>

                {appliedCoupon ? (
                  <strong className="discount">
                    - <i className="bi bi-currency-rupee"></i>
                    {couponDiscount.toLocaleString("en-IN")}{" "}
                    <button
                      type="button"
                      className="inline_link_btn"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </strong>
                ) : (
                  <button
                    type="button"
                    className="apply_coupon_link"
                    onClick={() => setShowCouponInput((previous) => !previous)}
                  >
                    Apply Coupon
                  </button>
                )}
              </div>

              {showCouponInput && !appliedCoupon && (
                <div className="promo_code">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(event) =>
                      setCouponCode(event.target.value.toUpperCase())
                    }
                    disabled={couponLoading}
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}

              {couponMessage && (
                <p
                  className={
                    appliedCoupon
                      ? "coupon_message success"
                      : "coupon_message error"
                  }
                >
                  {couponMessage}
                </p>
              )}

              <div className="summary_row">
                <span>
                  Platform Fee{" "}
                  <button
                    type="button"
                    className="know_more_link"
                    onClick={() => setShowPlatformFee(true)}
                  >
                    Know More
                  </button>
                </span>

                <strong>
                  <i className="bi bi-currency-rupee"></i>
                  {pricing ? pricing.platformFee.toLocaleString("en-IN") : "—"}
                </strong>
              </div>

              <div className="summary_row">
                <span>Free shipping above</span>
                <strong>
                  {pricing
                    ? `₹${pricing.freeShippingLimit.toLocaleString("en-IN")}`
                    : "—"}
                </strong>
              </div>

              <div className="summary_row">
                <span>Shipping</span>

                <strong>
                  {pricingLoading ? (
                    "Loading…"
                  ) : pricingError ? (
                    "Unavailable"
                  ) : shipping === 0 && subtotal > 0 ? (
                    <span className="free_shipping">FREE</span>
                  ) : (
                    <>
                      <i className="bi bi-currency-rupee"></i>
                      {shipping.toLocaleString("en-IN")}
                    </>
                  )}
                </strong>
              </div>

              {pricingError && (
                <p className="shipping_message" role="alert">
                  {pricingError}{" "}
                  <button
                    type="button"
                    onClick={() => setPricingRetry((attempt) => attempt + 1)}
                  >
                    Retry
                  </button>
                </p>
              )}

              {pricing && subtotal > 0 && subtotal < freeShippingLimit && (
                <p className="shipping_message">
                  Add ₹{(freeShippingLimit - subtotal).toLocaleString("en-IN")}{" "}
                  more to get free shipping.
                </p>
              )}

              {pricing && subtotal >= freeShippingLimit && subtotal > 0 && (
                <p
                  className="shipping_message"
                  style={{ position: "relative" }}
                >
                  🎉 You unlocked free shipping 🎉
                </p>
              )}

              <div className="summary_total">
                <span>Total Amount</span>

                <strong>
                  <i className="bi bi-currency-rupee"></i>
                  {pricing ? total.toLocaleString("en-IN") : "—"}
                </strong>
              </div>

              <p className="order_terms">
                By placing the order, you agree to Zyora's{" "}
                <a href="/terms">Terms of Use</a> and{" "}
                <a href="/privacy">Privacy Policy</a>
              </p>

              <div className="cart_address_section">
                <div className="cart_address_heading">
                  <h3>Select Address</h3>

                  <button
                    type="button"
                    className="add_address_btn"
                    onClick={() =>
                      navigate(
                        customer?.customerId
                          ? `/Profile/${customer.customerId}?tab=addresses`
                          : "/Login",
                      )
                    }
                  >
                    {addresses.length > 0 ? "Manage addresses" : "Add address"}
                  </button>
                </div>

                {addresses.length > 0 && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        width: "100%",
                      }}
                    >
                      <select
                        className="cart_address_select"
                        value={selectedAddressIndex}
                        onChange={(event) =>
                          setSelectedAddressIndex(Number(event.target.value))
                        }
                        aria-label="Select delivery address"
                        style={{ flex: 1 }}
                      >
                        {addresses.map((address, index) => (
                          <option
                            key={`${address.mobile}-${index}`}
                            value={index}
                          >
                            {address.name} - {address.houseNumber},{" "}
                            {address.city} - {address.pinCode}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="remove_address_btn"
                        onClick={() =>
                          handleDeleteAddress(selectedAddressIndex)
                        }
                        aria-label="Delete selected address"
                        title="Delete selected address"
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>

                    <p className="cart_selected_address">
                      {addresses[selectedAddressIndex]?.address},
                      {addresses[selectedAddressIndex]?.locality},
                      {addresses[selectedAddressIndex]?.state}
                    </p>
                  </>
                )}
              </div>

              <button
                className="checkout_btn"
                type="button"
                disabled={
                  selectedItems.length === 0 ||
                  !pricing ||
                  pricingLoading ||
                  Boolean(pricingError) ||
                  placingOrder
                }
                onClick={handlePlaceOrder}
              >
                {placingOrder ? "PLACING ORDER…" : "PLACE ORDER"}
              </button>

              <Confetti active={celebrate} burstKey={burstKey} />
            </aside>
          </div>
        </section>
      )}

      {/* Platform fee popup (outside the aside so it isn't clipped) */}
      {showPlatformFee && (
        <div
          className="platform_fee_overlay"
          onClick={() => setShowPlatformFee(false)}
        >
          <div
            className="platform_fee_popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="platform_fee_close"
              onClick={() => setShowPlatformFee(false)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3>Platform Fee</h3>

            <p>
              Fee levied by Zyora to sustain the efficient operations and
              continuous improvement of the platform, for a hassle-free shopping
              experience.
            </p>

            <div className="platform_fee_footer">
              Have a question? Refer <button type="button">FAQs</button> or read{" "}
              <button type="button">T&amp;Cs</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon popup */}
      {/* {showCouponPopup && (
        <div
          className="platform_fee_overlay"
          onClick={() => setShowCouponPopup(false)}
        >
          <div
            className="platform_fee_popup coupon_popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="platform_fee_close"
              onClick={() => setShowCouponPopup(false)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <h3>Available Coupons</h3>

            {couponsLoading ? (
              <p>Loading coupons...</p>
            ) : couponsError ? (
              <p className="coupon_message error">{couponsError}</p>
            ) : availableCoupons.length === 0 ? (
              <p>No coupons available right now.</p>
            ) : (
              <div className="coupon_list">
                {availableCoupons.map((coupon) => {
                  const isApplied = appliedCoupon?.code === coupon.code;

                  return (
                    <div className="coupon_card" key={coupon.code}>
                      <div className="coupon_card_info">
                        <strong>{coupon.code}</strong>
                        <p>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="coupon_card_btn"
                        disabled={couponLoading || isApplied}
                        onClick={async () => {
                          const ok = await applyCoupon(coupon.code);
                          if (ok) setShowCouponPopup(false);
                        }}
                      >
                        {isApplied ? "APPLIED" : "APPLY"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {couponMessage && !appliedCoupon && (
              <p className="coupon_message error">{couponMessage}</p>
            )}
          </div>
        </div>
      )} */}
      <CouponPopup
        open={showCouponPopup}
        onClose={() => setShowCouponPopup(false)}
        coupons={availableCoupons}
        loading={couponsLoading}
        error={couponsError}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        applying={couponLoading}
        message={couponMessage}
        onApply={applyCoupon}
      />
    </div>
  );
};

export default Cart;
