import "./Contact.css";
import { useState } from "react";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import axios from "axios";
import toast from "react-hot-toast";
import { MdKeyboardArrowRight } from "react-icons/md";
import peak from "../../assets/Images/peak1.png";
import SEO from "../../SEO";
import ScrollReveal from "../../Components/ScrollReveal.jsx";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ORDER_RELATED_ENQUIRY_TYPES = [
  "Order Status / Tracking",
  "Order Cancellation",
  "Return or Exchange",
  "Refund Status",
  "Payment Issue",
  "Damaged or Defective Product",
  "Delivery / Shipping Issue",
];

const Contact = () => {
  const siteUrl = (import.meta.env.VITE_API_DOMAIN || "").replace(/\/$/, "");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ shouldUnregister: true });

  const [loading, setLoading] = useState(false);
  const isOrderRelated = ORDER_RELATED_ENQUIRY_TYPES.includes(
    watch("enquiryType"),
  );

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/contact/Submit-Contact`,
        data,
      );
      if (res.data.emailSent === false) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message);
      }
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
    <>
      <SEO
        title="Contact ZYORA | Customer Support & Assistance"
        description="Get in touch with ZYORA for product enquiries, order assistance, customer support and general questions. Our team is here to help with your shopping experience, product information, delivery, returns and other queries. Contact ZYORA for reliable and friendly support."
        canonical={`${import.meta.env.VITE_API_DOMAIN}/Contact_Us`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact ZYORA",
          url: `${siteUrl}/Contact_Us`,
          mainEntity: {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "ZYORA",
            url: siteUrl,
            email: "support@zyora.com",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+91 9965165261",
              email: "support@zyora.com",
              contactType: "customer support",
              availableLanguage: ["English"],
            },
          },
        }}
      />
      <div className="contact_main">
        <div id="page_path">
          <p>
            Home <MdKeyboardArrowRight /> Contact Us
          </p>
        </div>
        <ScrollReveal className="Contact">
          <div className="contact_content">
            <h1>
              Contact <span>us</span>
            </h1>
            <p>
              We'd love to hear from you. Have a question about your order, a
              product, or just want to say hi? Our team at ZYORA is here to
              help.
            </p>
            <br />
            <li>
              <p>
                <i className="bi bi-envelope-open-heart"></i>
                Email
              </p>
              <span>support@zyoraecom.in</span>
            </li>
            <li>
              <p>
                <i className="bi bi-whatsapp"></i>
                Phone / WhatsApp
              </p>
              <span>+91 7010423318</span>
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
            <h1>
              Tell us <span>about it</span>
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label>Name*</label>
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
                <label>Email*</label>
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
                <label>Phone Number*</label>
                <input
                  type="number"
                  placeholder="Enter your mobile number"
                  {...register("phone", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  })}
                />
                {errors.phone && <span>{errors.phone.message}</span>}
              </div>

              <div>
                <label>Enquiry Type*</label>
                <select
                  defaultValue=""
                  {...register("enquiryType", {
                    required: "Please select an enquiry type",
                  })}
                >
                  <option value="" disabled>
                    Select Enquiry Type
                  </option>
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Product Information">
                    Product Information
                  </option>
                  <option value="Order Status / Tracking">
                    Order Status / Tracking
                  </option>
                  <option value="Order Cancellation">Order Cancellation</option>
                  <option value="Return or Exchange">Return or Exchange</option>
                  <option value="Refund Status">Refund Status</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Damaged or Defective Product">
                    Damaged or Defective Product
                  </option>
                  <option value="Delivery / Shipping Issue">
                    Delivery / Shipping Issue
                  </option>
                  <option value="Product Availability">
                    Product Availability
                  </option>
                  <option value="Bulk Order Enquiry">Bulk Order Enquiry</option>
                  <option value="Business / Wholesale Enquiry">
                    Business / Wholesale Enquiry
                  </option>
                  <option value="Website / Technical Issue">
                    Website / Technical Issue
                  </option>
                  <option value="Feedback or Suggestion">
                    Feedback or Suggestion
                  </option>
                  <option value="Complaint">Complaint</option>
                  <option value="Other">Other</option>
                </select>

                {errors.enquiryType && (
                  <span>{errors.enquiryType.message}</span>
                )}
              </div>

              {isOrderRelated && (
                <div>
                  <label htmlFor="contact-order-id">Order ID</label>
                  <input
                    id="contact-order-id"
                    type="text"
                    placeholder="Enter your order ID"
                    {...register("orderId", {
                      required: "Order ID is required for this enquiry",
                    })}
                  />
                  {errors.orderId && <span>{errors.orderId.message}</span>}
                </div>
              )}

              <div>
                <label>Message*</label>
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

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </>
  );
};

export default Contact;
