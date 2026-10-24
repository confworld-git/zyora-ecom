import "./Jewellery.css";
import { useMemo, useState } from "react";
import ParticleBackground from "./ParticleBackground";
import SEO from "../../SEO";
import JewelleryList from "./JewelleryList";
import { useProducts } from "../../Context/ProductContext.jsx";
import { isImitationJewellery } from "../../utils/productCategory.js";

const Jewellery = () => {
  const siteUrl = (import.meta.env.VITE_API_DOMAIN || "").replace(/\/$/, "");
  const { products } = useProducts();
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const jewelleryCategories = useMemo(
    () =>
      [
        ...new Map(
          products
            .filter(isImitationJewellery)
            .map((product) => String(product.subcategory || "").trim())
            .filter(Boolean)
            .map((subcategory) => [subcategory.toLowerCase(), subcategory]),
        ).values(),
      ].sort((first, second) => first.localeCompare(second)),
    [products],
  );
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
              {jewelleryCategories.length > 0 && (
                <div className="jewellery-categories">
                  <button
                    type="button"
                    className={!selectedSubcategory ? "is-selected" : ""}
                    aria-pressed={!selectedSubcategory}
                    onClick={() => setSelectedSubcategory("")}
                  >
                    All
                  </button>
                  {jewelleryCategories.map((subcategory) => (
                    <button
                      type="button"
                      key={subcategory}
                      className={
                        selectedSubcategory.toLowerCase() ===
                        subcategory.toLowerCase()
                          ? "is-selected"
                          : ""
                      }
                      aria-pressed={
                        selectedSubcategory.toLowerCase() ===
                        subcategory.toLowerCase()
                      }
                      onClick={() => setSelectedSubcategory(subcategory)}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <section>
            <JewelleryList selectedSubcategory={selectedSubcategory} />
          </section>
        </div>
      </div>
    </>
  );
};

export default Jewellery;
