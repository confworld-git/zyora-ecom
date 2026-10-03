import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;
const MAX_VALUE = 100000;

const FIELDS = [
  {
    name: "freeShippingLimit",
    label: "Free shipping above (₹)",
    hint: "Use 0 to make all shipping free.",
  },
  {
    name: "shippingCharge",
    label: "Shipping charge (₹)",
    hint: "Charged when the subtotal is below the limit.",
  },
  {
    name: "platformFee",
    label: "Platform fee (₹)",
    hint: "Added to every order.",
  },
];

const PricingSettings = () => {
  const [values, setValues] = useState({
    freeShippingLimit: "",
    shippingCharge: "",
    platformFee: "",
  });
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(`${API}/api/config/pricing`);

        if (!cancelled && res.data.success && res.data.pricing) {
          setSaved(res.data.pricing);
          setValues({
            freeShippingLimit: String(res.data.pricing.freeShippingLimit),
            shippingCharge: String(res.data.pricing.shippingCharge),
            platformFee: String(res.data.pricing.platformFee),
          });
        } else if (!cancelled) {
          setLoadError("Unable to load saved pricing settings.");
        }
      } catch (error) {
        console.error("Load pricing error:", error);
        if (!cancelled) {
          setLoadError("Unable to load saved pricing settings. You can still enter all values and save.");
          toast.error("Unable to load pricing settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const validValues = FIELDS.every(({ name }) => {
    const raw = values[name];
    const number = Number(raw);
    return raw !== "" && Number.isFinite(number) && number >= 0 && number <= MAX_VALUE;
  });
  const changed = saved
    ? FIELDS.some(({ name }) => Number(values[name]) !== saved[name])
    : validValues;
  const canSubmit = validValues && changed && !loading && !saving;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload = {};

    for (const { name, label } of FIELDS) {
      const raw = values[name];
      const number = Number(raw);

      if (
        raw === "" ||
        !Number.isFinite(number) ||
        number < 0 ||
        number > MAX_VALUE
      ) {
        toast.error(`Enter an amount between ₹0 and ₹${MAX_VALUE} for "${label}"`);
        return;
      }

      payload[name] = number;
    }

    try {
      setSaving(true);

      const res = await axios.put(`${API}/api/config/pricing`, payload, {
        withCredentials: true,
      });

      if (!res.data.success || !res.data.pricing) {
        throw new Error(res.data.message || "Unable to save pricing");
      }

      setSaved(res.data.pricing);
      setValues({
        freeShippingLimit: String(res.data.pricing.freeShippingLimit),
        shippingCharge: String(res.data.pricing.shippingCharge),
        platformFee: String(res.data.pricing.platformFee),
      });
      setLoadError("");
      toast.success("Pricing updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Unable to save pricing",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading pricing settings…</p>;

  return (
    <section className="admin-settings-card">
      <div className="admin-settings-header">
        <h2>Shipping &amp; fees</h2>
        <p className="pricing-settings-sub">
          These amounts apply to the cart and to every new order straight away.
        </p>
      </div>

      {loadError && <p role="alert">{loadError}</p>}

      <form onSubmit={handleSubmit}>
        {FIELDS.map(({ name, label, hint }) => (
          <div className="form-group" key={name}>
            <label htmlFor={`pricing-${name}`}>{label}</label>
            <p>{hint}</p>
            <input
              id={`pricing-${name}`}
              name={name}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_VALUE}
              step="1"
              value={values[name]}
              onChange={handleChange}
            />
          </div>
        ))}

        <button
          type="submit"
          className="update-admin-btn"
          disabled={!canSubmit}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
};

export default PricingSettings;
