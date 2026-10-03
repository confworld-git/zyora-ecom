import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, canonical, noindex = false, jsonLd }) => {
  const jsonLdContent = jsonLd
    ? JSON.stringify(jsonLd).replace(/</g, "\\u003c")
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLdContent && (
        <script type="application/ld+json">{jsonLdContent}</script>
      )}
    </Helmet>
  );
};

export default SEO;
