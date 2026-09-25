import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "zyora_wishlist";

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to parse saved wishlist:", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistItems),
      );
    } catch (err) {
      console.error("Failed to save wishlist:", err);
    }
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    const productId = product?.id ?? product?._id;

    if (!productId) return;

    const wishlistItem = {
      id: productId,

      name: product.name || product.title || "Product",
      title: product.title,
      brand: product.brand,

      image: product.images?.[0] || product.image || "",

      colors: product.variants?.colours || [],
      sizes: product.variants?.sizes || [],

      price:
        Number(
          typeof product.price === "object"
            ? product.price?.selling_price
            : product.price,
        ) || 0,

      // MRP
      mrp:
        Number(
          typeof product.price === "object"
            ? product.price?.mrp
            : product.mrp,
        ) || 0,

      // Discount
      discountPercent:
        Number(
          typeof product.price === "object"
            ? product.price?.discount_percent
            : product.discount_percent,
        ) || 0,
    };

    setWishlistItems((currentItems) => {
      // Don't add duplicate products
      const alreadyExists = currentItems.some(
        (item) => String(item.id) === String(productId),
      );

      if (alreadyExists) {
        return currentItems;
      }

      return [...currentItems, wishlistItem];
    });
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((items) =>
      items.filter((item) => String(item.id) !== String(productId)),
    );
  };

  // Check if product is already in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => String(item.id) === String(productId),
    );
  };

  // Toggle wishlist
  const toggleWishlist = (product) => {
    const productId = product?.id ?? product?._id;

    if (!productId) return;

    const exists = wishlistItems.some(
      (item) => String(item.id) === String(productId),
    );

    if (exists) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  // Number of wishlist products
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,

        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within a WishlistProvider",
    );
  }

  return context;
};