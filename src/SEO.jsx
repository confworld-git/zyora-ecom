import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, canonical, noindex = false }) => {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default SEO;
