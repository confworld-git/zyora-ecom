export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Footwear",
  "Watches",
  "Home & Kitchen",
  "Sports & Fitness",
  "Beauty",
  "Stationery",
  "Handbags",
  "Accessories",
  "Soft Toys",
  "Immitation Jewellery",
];

export const normalizeProductCategory = (category) =>
  String(category || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const isImitationJewellery = (product) => {
  const category = normalizeProductCategory(product?.category);

  return (
    category.includes("imitationjewellery") ||
    category.includes("imitationjewelry") ||
    category.includes("immitationjewellery") ||
    category.includes("immitationjewelry")
  );
};
