export const isImitationJewellery = (product) => {
  const category = String(product?.category || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (
    category.includes("imitationjewellery") ||
    category.includes("imitationjewelry") ||
    category.includes("immitationjewellery") ||
    category.includes("immitationjewelry")
  );
};
