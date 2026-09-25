import "./Contact.css";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import toast from "react-hot-toast";
import { MdKeyboardArrowRight } from "react-icons/md";
import peak from "../../assets/Images/peak.gif"

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Contact = () => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/contact/Submit-Contact`,
        data,
      );
      toast.success(res.data.message);
      reset();
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact_main">
      <div id="page_path">
        <p>
          Home <MdKeyboardArrowRight /> Contact Us
        </p>
      </div>
      <div className="Contact">
        <div className="contact_content">
          <h1>
            CONTACT <span>US</span>
          </h1>
          <p>
            We'd Love to Hear From You Text: Have a question about your order, a
            product, or just want to say hi? Our team at ZYORA is here to help.
          </p>
          <br />
          <li>
            <p>
              <i className="bi bi-envelope-open-heart"></i>
              Email
            </p>
            <span>support@zyora.com</span>
          </li>
          <li>
            <p>
              <i className="bi bi-whatsapp"></i>
              Phone / WhatsApp
            </p>
            <span>+91 9965165261</span>
          </li>
          <li>
            <p>
              <i className="bi bi-headset"></i>
              Customer Support
            </p>
            <span>Monday-Saturday, 10 AM - 7 PM</span>
          </li>
        </div>
        <div className="contact_form">
          <img src={peak} alt="" />
          <p>Send a Message</p>
          <h1>Tell us about it.</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              {errors.name && <span>{errors.name.message}</span>}
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>

            <div>
              <label>Phone Number</label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Phone number is required" }}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    defaultCountry="IN"
                    value={value}
                    onChange={onChange}
                    placeholder="Enter phone number"
                  />
                )}
              />
              {errors.phone && <span>{errors.phone.message}</span>}
            </div>

            <div>
              <label>Enquiry Type</label>
              <input
                type="text"
                placeholder="Enter your enquiry type"
                {...register("enquiryType", {
                  required: "Enquiry type is required",
                })}
              />
              {errors.enquiryType && <span>{errors.enquiryType.message}</span>}
            </div>

            <div>
              <label>Message</label>
              <textarea
                placeholder="Write your message..."
                rows="5"
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
              />
              {errors.message && <span>{errors.message.message}</span>}
            </div>

            {/* {statusMsg && (
              <p
                className={
                  statusMsg.type === "success" ? "success-msg" : "error-msg"
                }
              >
                {statusMsg.text}
              </p>
            )} */}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
