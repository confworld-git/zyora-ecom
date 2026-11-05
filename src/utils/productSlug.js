export const PRODUCT_ROUTE_BASE = "/Zyora_Category/product";
export const PRODUCT_ROUTE_PATTERN = `${PRODUCT_ROUTE_BASE}/:productId/:slug`;

export const getProductId = (product) => product?.id ?? product?._id;

export const createProductSlug = (product) => {
  const name = product?.name || product?.title || "product";
  const slug = String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "product";
};

export const createProductPath = (product) => {
  const productId = getProductId(product);
  if (
    productId === undefined ||
    productId === null ||
    String(productId).trim() === ""
  ) {
    return null;
  }

  return `${PRODUCT_ROUTE_BASE}/${encodeURIComponent(productId)}/${encodeURIComponent(
    createProductSlug(product),
  )}`;
};

export const createProductUrl = (product, siteOrigin) => {
  const productPath = createProductPath(product);
  if (!productPath) return null;

  return new URL(productPath, `${new URL(siteOrigin).origin}/`).href;
};
