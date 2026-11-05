import { Helmet } from "react-helmet-async";
import defaultSocialImage from "./assets/Logo/Zyora_logo.jpeg";

const siteUrl = new URL(
  import.meta.env.VITE_API_DOMAIN || "https://zyoraecom.in",
).origin;
const defaultImage = new URL(defaultSocialImage, `${siteUrl}/`).href;
const canonicalQueryParameters = new Set(["category"]);

const getCanonicalUrl = (canonical) => {
  if (!canonical) return undefined;

  const url = new URL(canonical, `${siteUrl}/`);
  url.protocol = "https:";
  url.host = new URL(siteUrl).host;

  for (const parameter of [...url.searchParams.keys()]) {
    if (!canonicalQueryParameters.has(parameter)) {
      url.searchParams.delete(parameter);
    }
  }

  return url.href;
};

const getImageUrl = (image) => {
  if (!image) return defaultImage;

  try {
    const url = new URL(image, `${siteUrl}/`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : defaultImage;
  } catch {
    return defaultImage;
  }
};

const SEO = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
  jsonLd,
  additionalMeta = [],
}) => {
  const canonicalUrl = getCanonicalUrl(canonical);
  const socialImage = getImageUrl(image);
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const jsonLdContent = jsonLd
    ? JSON.stringify(jsonLd).replace(/</g, "\\u003c")
    : null;

  return (
    <Helmet>
      {normalizedTitle && <title>{normalizedTitle}</title>}
      {description && <meta name="description" content={description} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {normalizedTitle && (
        <meta property="og:title" content={normalizedTitle} />
      )}
      {description && (
        <meta property="og:description" content={description} />
      )}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="ZYORA" />
      <meta property="og:image" content={socialImage} />
      <meta name="twitter:card" content="summary_large_image" />
      {normalizedTitle && (
        <meta name="twitter:title" content={normalizedTitle} />
      )}
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      <meta name="twitter:image" content={socialImage} />
      {additionalMeta.map((item, index) => (
        <meta key={`${item.name || item.property}-${index}`} {...item} />
      ))}
      {jsonLdContent && (
        <script type="application/ld+json">{jsonLdContent}</script>
      )}
    </Helmet>
  );
};

export default SEO;
