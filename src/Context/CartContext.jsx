import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "zyora_cart";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to parse saved cart:", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cartItems]);

  const addToCart = (product, selectedColor, selectedSize) => {
    const productId = product?.id ?? product?._id;

    if (!productId) return;

    const cartItem = {
      cartId: `${String(productId)}-${selectedColor || "default"}-${selectedSize || "default"}`,

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
          typeof product.price === "object" ? product.price?.mrp : product.mrp,
        ) || 0,

      // Discount percentage from database
      discountPercent:
        Number(
          typeof product.price === "object"
            ? product.price?.discount_percent
            : product.discount_percent,
        ) || 0,

      color: selectedColor || "Not specified",

      size: selectedSize || "Not specified",

      quantity: 1,
    };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.cartId === cartItem.cartId,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartId === cartItem.cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, cartItem];
    });
  };

  const increaseQuantity = (cartId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (cartId) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((items) => items.filter((item) => item.cartId !== cartId));
  };

  const updateCartItemOption = (cartId, option, value) => {
    setCartItems((items) => {
      const item = items.find((currentItem) => currentItem.cartId === cartId);

      if (!item || item[option] === value) return items;

      const updatedItem = {
        ...item,
        [option]: value,
        cartId: `${String(item.id)}-${option === "color" ? value : item.color || "default"}-${option === "size" ? value : item.size || "default"}`,
      };
      const duplicate = items.find(
        (currentItem) =>
          currentItem.cartId === updatedItem.cartId &&
          currentItem.cartId !== cartId,
      );

      if (duplicate) {
        return items
          .filter((currentItem) => currentItem.cartId !== cartId)
          .map((currentItem) =>
            currentItem.cartId === updatedItem.cartId
              ? {
                  ...currentItem,
                  quantity: currentItem.quantity + item.quantity,
                }
              : currentItem,
          );
      }

      return items.map((currentItem) =>
        currentItem.cartId === cartId ? updatedItem : currentItem,
      );
    });
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        updateCartItemOption,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
