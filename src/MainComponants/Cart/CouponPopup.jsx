import "./CouponPopup.css";

const formatINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Works out what a coupon would save on the current subtotal and whether it can be used
const getCouponInfo = (coupon, subtotal) => {
  const min = Number(coupon.minimumOrderValue) || 0;
  const max = Number(coupon.maximumDiscount) || 0;
  const value = Number(coupon.discountValue) || 0;

  const expired =
    coupon.expiryDate && new Date(coupon.expiryDate).getTime() < Date.now();
  const exhausted =
    coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
  const inactive = coupon.status && coupon.status !== "active";
  const shortBy = Math.max(0, min - subtotal);

  let estimated =
    coupon.discountType === "percentage" ? (subtotal * value) / 100 : value;
  if (coupon.discountType === "percentage" && max > 0) {
    estimated = Math.min(estimated, max);
  }
  estimated = Math.min(estimated, subtotal);

  let reason = "";
  if (inactive) reason = "This coupon is not active.";
  else if (expired) reason = "This coupon has expired.";
  else if (exhausted) reason = "This coupon has reached its usage limit.";
  else if (shortBy > 0)
    reason = `Add ${formatINR(shortBy)} more to unlock this coupon.`;

  return { min, max, estimated, usable: !reason, reason };
};

const CouponPopup = ({
  open,
  onClose,
  coupons,
  loading,
  error,
  subtotal,
  appliedCoupon,
  applying,
  message,
  onApply, // async (code) => boolean
}) => {
  if (!open) return null;

  return (
    <div className="cp_overlay" onClick={onClose}>
      <div
        className="cp_sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp_title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cp_header">
          <h3 id="cp_title">Coupons for your bag</h3>
          <button
            type="button"
            className="cp_close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        {loading ? (
          <p className="cp_note">Loading coupons...</p>
        ) : error ? (
          <p className="cp_note cp_bad">{error}</p>
        ) : coupons.length === 0 ? (
          <p className="cp_note">No coupons available right now.</p>
        ) : (
          <div className="cp_list">
            {coupons.map((coupon) => {
              const isApplied = appliedCoupon?.code === coupon.code;
              const info = getCouponInfo(coupon, subtotal);
              const isPercent = coupon.discountType === "percentage";

              return (
                <article
                  className={`cp_card${isApplied ? " applied" : ""}${
                    info.usable ? "" : " locked"
                  }`}
                  key={coupon.code}
                >
                  <div className="cp_stub" aria-hidden="true">
                    <span className="cp_stub_value">
                      {isPercent
                        ? `${coupon.discountValue}%`
                        : formatINR(coupon.discountValue)}
                    </span>
                    <span className="cp_stub_word">
                      {isApplied ? "on" : "off"}
                    </span>
                  </div>

                  <div className="cp_body">
                    <div className="cp_body_head">
                      <strong className="cp_code">{coupon.code}</strong>

                      <button
                        type="button"
                        className="cp_apply"
                        disabled={applying || isApplied || !info.usable}
                        onClick={async () => {
                          const ok = await onApply(coupon.code);
                          if (ok) onClose();
                        }}
                      >
                        {isApplied ? "Applied" : "Apply"}
                      </button>
                    </div>

                    <dl className="cp_details">
                      {info.min > 0 && (
                        <div>
                          <dt>Minimum order</dt>
                          <dd>{formatINR(info.min)}</dd>
                        </div>
                      )}
                      {/* {isPercent && info.max > 0 && (
                        <div>
                          <dt>Maximum discount</dt>
                          <dd>{formatINR(info.max)}</dd>
                        </div>
                      )} */}
                      {coupon.expiryDate && (
                        <div>
                          <dt>Valid till</dt>
                          <dd>{formatDate(coupon.expiryDate)}</dd>
                        </div>
                      )}
                    </dl>

                    {info.usable ? (
                      <p className="cp_foot cp_good">
                        Saves {formatINR(info.estimated.toFixed(2))} on this bag
                      </p>
                    ) : (
                      <p className="cp_foot cp_bad">{info.reason}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {message && !appliedCoupon && (
          <p className="cp_note cp_bad">{message}</p>
        )}
      </div>
    </div>
  );
};

export default CouponPopup;
