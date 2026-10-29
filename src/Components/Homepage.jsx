import "../index.css";
import "./Homepage.css";
import Home from "./Home/Home";
import Welcome from "./Welcome/Welcome";
import Highlights from "./Highlights/Highlights";
import Featured from "./Featured/Featured";
import Why from "./Why/Why";
import SEO from "../SEO.jsx";
import logo from "../assets/Logo/Zyora_logo.jpeg";
import ScrollReveal from "./ScrollReveal.jsx";

const Homepage = () => {
  const siteUrl = (
    import.meta.env.VITE_SITE_URL || "https://zyoraecom.in"
  ).replace(/\/+$/, "");

  const homepageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "ZYORA",
        url: `${siteUrl}/`,
        logo: new URL(logo, `${siteUrl}/`).href,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "ZYORA",
        url: `${siteUrl}/`,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title="ZYORA | Shop Fashion, Handbags, Jewellery & Lifestyle Essentials"
        description="Discover handbags, jewellery, soft toys, stationery and home essentials at ZYORA. Shop everyday products online with secure payments and convenient delivery."
        canonical={`${siteUrl}/`}
        jsonLd={homepageJsonLd}
      />
      <main className="zyora-homepage">
        <Home />
        <ScrollReveal
          className="zyora-marquee"
          aria-label="Shop our categories"
        >
          <div className="zyora-marquee-track">
            <span>
              SOFT TOYS ✦ HOME &amp; KITCHEN ✦ STATIONERY ✦ FASHION ✦ HANDBAGS ✦
              JEWELLERY ✦
            </span>
            <span aria-hidden="true">
              SOFT TOYS ✦ HOME &amp; KITCHEN ✦ STATIONERY ✦ FASHION ✦ HANDBAGS ✦
              JEWELLERY ✦
            </span>
          </div>
        </ScrollReveal>
        <Welcome />
        <Highlights />
        <Featured />
        <Why />
      </main>
    </>
  );
};

export default Homepage;
