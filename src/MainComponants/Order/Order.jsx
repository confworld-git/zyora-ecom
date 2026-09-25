import { useState } from "react";
import toast from "react-hot-toast";
import "./Order.css";

const initialAddress = {
  name: "",
  mobile: "",
  houseNumber: "",
  address: "",
  locality: "",
  city: "",
  pinCode: "",
  state: "",
  addressType: "Home",
  isDefault: false,
};

const Order = ({ onAddressSaved, onCancel }) => {
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});

  const handleChange = ({ target }) => {
    const { name, value, type, checked } = target;
    setAddress((currentAddress) => ({
      ...currentAddress,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const validateAddress = () => {
    const requiredFields = [
      ["name", "Name is required"],
      ["mobile", "Mobile number is required"],
      ["houseNumber", "House number is required"],
      ["address", "Address is required"],
      ["locality", "Locality or town is required"],
      ["city", "City or district is required"],
      ["pinCode", "PIN code is required"],
      ["state", "State is required"],
    ];
    const nextErrors = Object.fromEntries(
      requiredFields
        .filter(([field]) => !address[field].trim())
        .map(([field, message]) => [field, message]),
    );

    if (
      address.mobile.trim() &&
      !/^\+?[0-9\s-]{10,15}$/.test(address.mobile.trim())
    ) {
      nextErrors.mobile = "Enter a valid mobile number";
    }
    if (address.pinCode.trim() && !/^\d{6}$/.test(address.pinCode.trim())) {
      nextErrors.pinCode = "Enter a valid 6-digit PIN code";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(Object.values(nextErrors)[0]);
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleOrderSubmit = (event) => {
    event.preventDefault();
    if (!validateAddress()) return;

    if (address.isDefault) {
      localStorage.setItem("defaultAddress", JSON.stringify(address));
    }
    onAddressSaved?.(address);
    toast.success(
      address.isDefault
        ? "Address saved as your default address"
        : "Address saved successfully",
    );
  };

  return (
    <div className="order_customer_detail">
      <h1>Contact Detail</h1>
      <form
        className="order_address_form"
        onSubmit={handleOrderSubmit}
        noValidate
      >
        <div className="order_field_group">
          <input
            name="name"
            type="text"
            placeholder="Name*"
            aria-label="Name"
            value={address.name}
            onChange={handleChange}
          />
          {errors.name && <span className="order_error">{errors.name}</span>}
        </div>

        <div className="order_field_group">
          <input
            name="mobile"
            type="tel"
            placeholder="Mobile No*"
            aria-label="Mobile Number"
            value={address.mobile}
            onChange={handleChange}
          />
          {errors.mobile && (
            <span className="order_error">{errors.mobile}</span>
          )}
        </div>

        <div className="order_field_group">
          <input
            name="houseNumber"
            type="text"
            placeholder="House Number/ Tower/Block*"
            aria-label="House Number"
            value={address.houseNumber}
            onChange={handleChange}
          />
          <span>*House Number will allow a doorstep delivery</span>
          {errors.houseNumber && (
            <span className="order_error">{errors.houseNumber}</span>
          )}
        </div>

        <div className="order_field_group">
          <input
            name="address"
            type="text"
            placeholder="Address (locality,building,street)*"
            aria-label="Address"
            value={address.address}
            onChange={handleChange}
          />
          <span>*Please update society/apartment details</span>
          {errors.address && (
            <span className="order_error">{errors.address}</span>
          )}
        </div>

        <div className="order_field_group">
          <input
            name="locality"
            type="text"
            placeholder="Locality / Town*"
            aria-label="Locality / Town"
            value={address.locality}
            onChange={handleChange}
          />
          {errors.locality && (
            <span className="order_error">{errors.locality}</span>
          )}
        </div>

        <div className="order_field_group">
          <input
            name="city"
            type="text"
            placeholder="City / District*"
            aria-label="City"
            value={address.city}
            onChange={handleChange}
          />
          {errors.city && <span className="order_error">{errors.city}</span>}
        </div>

        <div className="order_field_group">
          <input
            name="pinCode"
            type="text"
            inputMode="numeric"
            placeholder="Pin Code*"
            aria-label="Pin Code"
            value={address.pinCode}
            onChange={handleChange}
          />
          {errors.pinCode && (
            <span className="order_error">{errors.pinCode}</span>
          )}
        </div>

        <div className="order_field_group">
          <input
            name="state"
            type="text"
            placeholder="State*"
            aria-label="State"
            value={address.state}
            onChange={handleChange}
          />
          {errors.state && <span className="order_error">{errors.state}</span>}
        </div>

        <div>
          <div className="order_section_title small">Address Type</div>
          <div className="order_address_type">
            <label className="radio_option">
              <input
                type="radio"
                name="addressType"
                value="Home"
                checked={address.addressType === "Home"}
                onChange={handleChange}
              />
              <span className="radio_circle" aria-hidden="true"></span>
              <span>Home</span>
            </label>
            <label className="radio_option">
              <input
                type="radio"
                name="addressType"
                value="Office"
                checked={address.addressType === "Office"}
                onChange={handleChange}
              />
              <span className="radio_circle" aria-hidden="true"></span>
              <span>Office</span>
            </label>
          </div>
          <div className="order_default_checkbox">
            <input
              name="isDefault"
              type="checkbox"
              checked={address.isDefault}
              onChange={handleChange}
            />
            <span>Make this as my default address</span>
          </div>
          <div className="order_form_actions">
            <button
              type="button"
              className="order_cancel_btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" className="order_save_btn">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Order;
