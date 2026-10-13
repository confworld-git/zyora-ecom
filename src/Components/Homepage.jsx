import "../index.css";
import "./Homepage.css";
import Home from "./Home/Home";
import Welcome from "./Welcome/Welcome";
import Highlights from "./Highlights/Highlights";
import Featured from "./Featured/Featured";
import Why from "./Why/Why";
import SEO from "../SEO.jsx";
import logo from "../assets/Logo/Zyora_logo.jpeg";

const Homepage = () => {
  const siteUrl = (import.meta.env.VITE_API_DOMAIN || "").replace(/\/$/, "");
  const homepageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ZYORA",
        url: siteUrl,
        ...(siteUrl && { logo: new URL(logo, siteUrl).href }),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "ZYORA",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <SEO
        title="ZYORA | Destination for E-commerce"
        description="Shop at ZYORA for quality, functional and affordable products for everyday life. Discover home and kitchen essentials, stationery, handbags, soft toys, fashion, footwear, electronics, watches, beauty, sports and fitness products, and more. Enjoy competitive prices, secure payments, reliable delivery and easy 7-day returns."
        canonical={import.meta.env.VITE_API_DOMAIN}
        jsonLd={homepageJsonLd}
      />
      <main className="zyora-homepage">
        <Home />
        <div className="zyora-marquee" aria-label="Shop our categories">
          <div className="zyora-marquee-track">
            <span>
              SOFT TOYS ✦ HOME &amp; KITCHEN ✦ STATIONERY ✦ FASHION ✦ HANDBAGS
              ✦ JEWELLERY ✦
            </span>
            <span aria-hidden="true">
              SOFT TOYS ✦ HOME &amp; KITCHEN ✦ STATIONERY ✦ FASHION ✦ HANDBAGS
              ✦ JEWELLERY ✦
            </span>
          </div>
        </div>
        <Welcome />
        <Highlights />
        <Featured />
        <Why />
      </main>
    </>
  );
};

export default Homepage;
