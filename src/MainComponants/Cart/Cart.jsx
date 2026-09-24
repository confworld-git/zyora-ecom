import "./Cart.css";
import { useState, useEffect, useRef } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { useCart } from "../../Context/CartContext.jsx";
import Confetti from "../../Confetti/Confetti.jsx";

const Cart = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    updateCartItemOption,
    subtotal,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [showPlatformFee, setShowPlatformFee] = useState(false);

  const FREE_SHIPPING_LIMIT = 1999;
  const SHIPPING_CHARGE = 250;
  const PLATFORM_FEE = 23;

  const shipping =
    subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_CHARGE;

  const coupons = {
    ZYORA10: {
      type: "percentage",
      value: 10,
      maxDiscount: 500,
    },

    ZYORA50: {
      type: "fixed",
      value: 50,
    },
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const coupon = coupons[appliedCoupon];
    if (!coupon) return 0;
    if (coupon.type === "percentage") {
      const percentageDiscount = (subtotal * coupon.value) / 100;

      return Math.min(
        percentageDiscount,
        coupon.maxDiscount ?? percentageDiscount,
      );
    }

    if (coupon.type === "fixed") {
      return Math.min(coupon.value, subtotal);
    }

    return 0;
  };

  const totalMRP = cartItems.reduce((total, item) => {
    const mrp = Number(item.mrp) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + mrp * quantity;
  }, 0);

  const productDiscount = cartItems.reduce((total, item) => {
    const mrp = Number(item.mrp) || 0;
    const sellingPrice = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + Math.max(0, mrp - sellingPrice) * quantity;
  }, 0);

  const couponDiscount = calculateDiscount();
  const totalItemsCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const total = Math.max(
    0,
    subtotal + shipping - couponDiscount + PLATFORM_FEE,
  );

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    setCouponMessage("");
    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    if (!coupons[code]) {
      setAppliedCoupon(null);
      setCouponMessage("Invalid coupon code.");
      return;
    }
    setAppliedCoupon(code);
    const coupon = coupons[code];
    if (coupon.type === "percentage") {
      setCouponMessage(`${coupon.value}% discount applied.`);
    } else {
      setCouponMessage(`₹${coupon.value} discount applied.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setShowCouponInput(false);
  };

  const [celebrate, setCelebrate] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const wasFreeShippingRef = useRef(
    subtotal >= FREE_SHIPPING_LIMIT && subtotal > 0,
  );

  useEffect(() => {
    const isFreeShippingNow = subtotal >= FREE_SHIPPING_LIMIT && subtotal > 0;
    if (isFreeShippingNow && !wasFreeShippingRef.current) {
      setBurstKey((k) => k + 1);
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2800);
      wasFreeShippingRef.current = isFreeShippingNow;
      return () => clearTimeout(timer);
    }
    wasFreeShippingRef.current = isFreeShippingNow;
  }, [subtotal]);

  return (
    <div className="cart">
      <h1 className="cart_title">
        Your <span>Cart</span>
      </h1>
      <p>You’ve got taste, and honestly, we’re impressed.</p>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart and they will appear here.</p>
        </div>
      ) : (
        <section className="cart_section">
          <div className="cart_left_section">
            {cartItems.map((item) => (
              <div className="cart_item" key={item.cartId}>
                <img src={item.image} alt={item.name} />

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

                      {/* COLOR */}

                      <label className="cart_option">
                        <span>Color:</span>

                        {item.colors?.length > 0 ? (
                          <select
                            value={item.color}
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
                        onClick={() => decreaseQuantity(item.cartId)}
                        aria-label="Decrease quantity"
                      >
                        <i className="bi bi-dash"></i>
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.cartId)}
                        aria-label="Increase quantity"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart_trash"
                      onClick={() => removeFromCart(item.cartId)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  onClick={() => setShowCouponInput((prev) => !prev)}
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
                  onChange={(event) => setCouponCode(event.target.value)}
                />
                <button type="button" onClick={handleApplyCoupon}>
                  Apply
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
                Platform Fee
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
                {PLATFORM_FEE}
              </strong>
            </div>

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
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>

                  <h3>Platform Fee</h3>

                  <p>
                    Fee levied by Zyora to sustain the efficient operations and
                    continuous improvement of the platform, for a hassle-free
                    shopping experience.
                  </p>

                  <div className="platform_fee_footer">
                    Have a question? Refer <button type="button">FAQs</button>{" "}
                    or read <button type="button">T&amp;Cs</button>
                  </div>
                </div>
              </div>
            )}

            <div className="summary_row">
              <span>Shipping</span>
              <strong>
                {shipping === 0 ? (
                  <span className="free_shipping">FREE</span>
                ) : (
                  <>
                    <i className="bi bi-currency-rupee"></i>
                    {shipping.toLocaleString("en-IN")}
                  </>
                )}
              </strong>
            </div>
            {subtotal > 0 && subtotal < FREE_SHIPPING_LIMIT && (
              <p className="shipping_message">
                Add ₹{(FREE_SHIPPING_LIMIT - subtotal).toLocaleString("en-IN")}{" "}
                more to get free shipping.
              </p>
            )}

            {subtotal >= FREE_SHIPPING_LIMIT && (
              <p className="shipping_message" style={{ position: "relative" }}>
                🎉 You unlocked free shipping 🎉
              </p>
            )}

            <div className="summary_total">
              <span>Total Amount</span>

              <strong>
                <i className="bi bi-currency-rupee"></i>
                {total.toLocaleString("en-IN")}
              </strong>
            </div>

            <p className="order_terms">
              By placing the order, you agree to Zyora's{" "}
              <a href="/terms">Terms of Use</a> and{" "}
              <a href="/privacy">Privacy Policy</a>
            </p>

            <button className="checkout_btn" type="button">
              PLACE ORDER
            </button>
            <Confetti active={celebrate} burstKey={burstKey} />
          </aside>
        </section>
      )}
    </div>
  );
};

export default Cart;
