import { useMemo, useState } from "react";
import "./Faq.css";
import SEO from "../SEO.jsx";

const faq_content = [
  {
    website: "https://zyoraecom.in/",
    brand: "ZYORA",
    title: "Frequently Asked Questions",
    faqs: [
      {
        id: 1,
        category: "General",
        question: "Why should I shop with ZYORA?",
        answer:
          "At ZYORA, we focus on quality-checked products, everyday value, convenient shopping, secure checkout, reliable delivery and friendly customer support. Explore our collections and enjoy a convenient online shopping experience.",
      },
      {
        id: 2,
        category: "Orders",
        question: "How can I place an order on ZYORA?",
        answer:
          "Visit https://zyoraecom.in/, browse our product collections, select your favourite products, add them to your shopping cart and proceed to checkout. Enter your delivery details, select an available payment method and confirm your order.",
      },
      {
        id: 3,
        category: "Shipping",
        question: "Do you deliver products across India?",
        answer:
          "Yes. ZYORA delivers to eligible serviceable PIN codes across India. Delivery availability depends on the courier partner's coverage in your location.",
      },
      {
        id: 4,
        category: "Payments",
        question: "What payment methods are available?",
        answer:
          "Customers can use the payment options displayed at checkout. ZYORA provides secure online payment facilities through Razorpay. Cash on Delivery (COD) is also available where supported.",
      },
      {
        id: 5,
        category: "Returns and Refunds",
        question:
          "What should I do if I receive a damaged or incorrect product?",
        answer:
          "Kindly contact us through this mail id support@zyoraecom.in Include your order details and photographs of the product, packaging and shipping label so our team can review your request.",
      },
      {
        id: 6,
        category: "Orders",
        question: "Do I need to create an account to place an order?",
        answer:
          "You can proceed using the shopping and checkout options available on our website. Follow the checkout instructions to complete your purchase.",
      },
      {
        id: 7,
        category: "Shipping",
        question: "How long does delivery take?",
        answer:
          "Orders are generally processed within 1–3 business days. Estimated delivery is approximately 2–5 business days for metro cities and 4–8 business days for other serviceable locations. Remote areas may require additional time.",
      },
    ],
    contact: {
      email: "support@zyoraecom.in",
      phone: "+91 7010423318",
      website: "https://zyoraecom.in/",
    },
  },
];

const siteUrl = new URL(
  import.meta.env.VITE_API_DOMAIN || "https://zyoraecom.in",
).origin;
const canonicalUrl = `${siteUrl}/frequently-asked-questions`;
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "Frequently Asked Questions",
  url: canonicalUrl,
  mainEntity: faq_content[0].faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const LINK_RE =
  /(https?:\/\/[^\s,]*[^\s,.]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\+91 \d{10})/g;

const linkify = (text) =>
  text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    let href = part;
    if (part.includes("@")) href = `mailto:${part}`;
    else if (part.startsWith("+91")) href = `tel:${part.replace(/\s/g, "")}`;
    return (
      <a
        key={i}
        href={href}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
      >
        {part}
      </a>
    );
  });

const Faq = () => {
  const { faqs, contact } = faq_content[0];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openId, setOpenId] = useState(faq_content[0].faqs[0].id);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (!q ||
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)),
    );
  }, [faqs, query, category]);

  const clear = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <main className="zfaq">
      <SEO
        title="Frequently Asked Questions | ZYORA"
        description="Find answers about ZYORA orders, shipping, payments, returns, refunds, and customer support. Get help with shopping and delivery across India."
        canonical={canonicalUrl}
        jsonLd={faqJsonLd}
      />
      <header className="faq-heading">
        <p className="policies-eyebrow">ZYORA HELP CENTER</p>
        <h1>FAQ</h1>
      </header>

      <div className="zfaq-wrap zfaq-body">
        <div className="zfaq-main">

          {visible.length > 0 ? (
            <ul className="zfaq-list">
              {visible.map((f) => {
                const open = openId === f.id;
                return (
                  <li
                    key={f.id}
                    className={`zfaq-item${open ? " is-open" : ""}`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={`zfaq-q-${f.id}`}
                        aria-expanded={open}
                        aria-controls={`zfaq-a-${f.id}`}
                        onClick={() => setOpenId(open ? null : f.id)}
                      >
                        <span className="zfaq-q">{f.question}</span>
                        <span className="zfaq-icon" aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      id={`zfaq-a-${f.id}`}
                      role="region"
                      aria-labelledby={`zfaq-q-${f.id}`}
                      className="zfaq-panel"
                    >
                      <div className="zfaq-panel-inner">
                        <p>{linkify(f.answer)}</p>
                        <span className="zfaq-cat">{f.category}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="zfaq-empty">
              <h3>No answers for “{query}”</h3>
              <p>
                Check the spelling, try a shorter word, or email us at{" "}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>.
              </p>
              <button type="button" onClick={clear}>
                Clear search
              </button>
            </div>
          )}
        </div>

        <aside className="zfaq-contact" aria-labelledby="zfaq-contact-title">
          <h2 id="zfaq-contact-title">Still need a hand?</h2>
          <p>
            Our support team replies by email, phone and WhatsApp. Keep your
            order details ready.
          </p>

          <a className="zfaq-btn" href={`mailto:${contact.email}`}>
            Email support
          </a>
          <a
            className="zfaq-btn zfaq-btn-alt"
            href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>

          {/* <dl>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt>Damaged item?</dt>
              <dd>Write to us within 48 hours of delivery with photos.</dd>
            </div>
          </dl> */}
        </aside>
      </div>
    </main>
  );
};

export default Faq;
