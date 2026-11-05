import { getProductId } from "./productSlug.js";

const SITE_BRAND = "ZYORA";

const escapeRegularExpression = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const removeBrandNames = (value, brands) => {
  let name = value;

  for (const brand of brands) {
    const normalizedBrand = String(brand ?? "").trim();
    if (!normalizedBrand) continue;

    const expression = new RegExp(
      `(^|[^\\p{L}\\p{N}])${escapeRegularExpression(normalizedBrand)}(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );
    name = name.replace(expression, "$1");
  }

  return name
    .replace(/^\s*[|·:–—-]+\s*|\s*[|·:–—-]+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const createBaseProductSeoTitle = (product) => {
  const rawName = String(product?.name || product?.title || "Product")
    .replace(/\s+/g, " ")
    .trim();
  const brand = String(product?.brand ?? "").replace(/\s+/g, " ").trim();
  const productName = removeBrandNames(rawName, [brand, SITE_BRAND]) || rawName;
  const titleParts = [productName];

  if (brand && brand.toLowerCase() !== SITE_BRAND.toLowerCase()) {
    titleParts.push(brand);
  }

  titleParts.push(SITE_BRAND);
  return titleParts.join(" | ");
};

export const createProductSeoTitle = (product, products = []) => {
  const baseTitle = createBaseProductSeoTitle(product);
  const productId = String(getProductId(product) ?? "");
  const matchingProducts = products.filter(
    (candidate) =>
      String(getProductId(candidate) ?? "") !== productId &&
      createBaseProductSeoTitle(candidate) === baseTitle,
  );
  if (matchingProducts.length === 0) return baseTitle;

  const otherColors = new Set(
    matchingProducts.flatMap((candidate) =>
      (candidate.variants?.colours || []).map((color) =>
        String(color ?? "").trim().toLowerCase(),
      ),
    ),
  );
  const uniqueColor = (product.variants?.colours || [])
    .map((color) => String(color ?? "").trim())
    .find((color) => color && !otherColors.has(color.toLowerCase()));
  const descriptor =
    uniqueColor ||
    (product.sku ? `SKU ${String(product.sku).trim()}` : `Item ${productId}`);

  return `${baseTitle} | ${descriptor}`;
};
