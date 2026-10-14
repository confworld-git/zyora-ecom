export const normalizeProductRating = (rating) => {
  const average = Number(rating?.average);
  const count = Number(rating?.count);

  return {
    average: Number.isFinite(average)
      ? Math.min(5, Math.max(0, average))
      : 0,
    count: Number.isSafeInteger(count) && count >= 0 ? count : 0,
  };
};
