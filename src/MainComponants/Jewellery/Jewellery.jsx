import "./Jewellery.css";
import ParticleBackground from "./ParticleBackground";
import { IoIosArrowDown } from "react-icons/io";
import SEO from "../../SEO";

const Jewellery = () => {
  const siteUrl = (import.meta.env.VITE_API_DOMAIN || "").replace(/\/$/, "");
  const jewelleryCategories = [
    "Necklaces",
    "Earrings",
    "Bracelets",
    "Rings",
    "Anklets",
  ];
  const jewelleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Imitation Jewellery for Women | ZYORA",
    description:
      "Explore stylish and affordable imitation jewellery at ZYORA, including necklaces, earrings, bracelets, rings and anklets.",
    url: `${siteUrl}/Jewellery`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: jewelleryCategories.map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@type": "Thing", name },
      })),
    },
  };

  return (
    <>
      <SEO
        title=" Imitation Jewellery for Women | Stylish & Affordable Jewellery | ZYORA"
        description="Explore stylish and affordable imitation jewellery at ZYORA. Discover elegant earrings, necklaces, bracelets, rings and more for everyday wear and special occasions."
        canonical={`${import.meta.env.VITE_API_DOMAIN}/Jewellery`}
        jsonLd={jewelleryJsonLd}
      />
      <div className="jewellery-container">
        <ParticleBackground />
        <div>
          <div>
            <h1>Shine Your Way</h1>
            <p>
              Elegant imitation jewellery to add sparkle to every occasion. Find
              pieces that match your style, mood, and personality.
            </p>
            <div className="jewellery-categories">
              {jewelleryCategories.map((category) => (
                <p key={category}>{category}</p>
              ))}
            </div>
            <button className="shop-now-button-jew">
              <IoIosArrowDown />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Jewellery;
