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

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cartItems]);

  // ADD TO CART
  const addToCart = (product, selectedColor, selectedSize) => {
    const productId = product?.id ?? product?._id;

    if (!productId) return;

    /*
      Product page data:
      product.variants.colours
      product.variants.sizes

      Wishlist data:
      product.colors
      product.sizes
    */

    const colors =
      product?.variants?.colours ??
      product?.colors ??
      [];

    const sizes =
      product?.variants?.sizes ??
      product?.sizes ??
      [];

    const price =
      Number(
        typeof product.price === "object"
          ? product.price?.selling_price
          : product.price
      ) || 0;

    const mrp =
      Number(
        typeof product.price === "object"
          ? product.price?.mrp
          : product.mrp
      ) || 0;

    const discountPercent =
      Number(
        typeof product.price === "object"
          ? product.price?.discount_percent
          : product.discountPercent ?? product.discount_percent
      ) || 0;

    const color = selectedColor || "Not specified";
    const size = selectedSize || "Not specified";

    // Same product + same color + same size = same cart item
    const cartId = `${String(productId)}-${color}-${size}`;

    const cartItem = {
      cartId,

      id: productId,
      name: product.name || product.title || "Product",
      title: product.title,
      brand: product.brand,

      image:
        product.images?.[0] ||
        product.image ||
        "",

      colors,
      sizes,

      price,
      mrp,
      discountPercent,

      color,
      size,

      quantity: 1,
    };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.cartId === cartId
      );

      // Same product + same variant
      if (existingItem) {
        return currentItems.map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // New product / new variant
      return [...currentItems, cartItem];
    });
  };

  // INCREASE QUANTITY
  const increaseQuantity = (cartId) => {
    setCartItems((items) =>
      items.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (cartId) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // REMOVE ITEM
  const removeFromCart = (cartId) => {
    setCartItems((items) =>
      items.filter((item) => item.cartId !== cartId)
    );
  };

  // UPDATE SIZE / COLOR
  const updateCartItemOption = (cartId, option, value) => {
    setCartItems((items) => {
      const item = items.find(
        (currentItem) => currentItem.cartId === cartId
      );

      if (!item || item[option] === value) {
        return items;
      }

      const newColor =
        option === "color"
          ? value
          : item.color || "Not specified";

      const newSize =
        option === "size"
          ? value
          : item.size || "Not specified";

      const newCartId = `${String(item.id)}-${newColor}-${newSize}`;

      const duplicate = items.find(
        (currentItem) =>
          currentItem.cartId === newCartId &&
          currentItem.cartId !== cartId
      );

      // If the selected variant already exists,
      // merge the quantities.
      if (duplicate) {
        return items
          .filter(
            (currentItem) => currentItem.cartId !== cartId
          )
          .map((currentItem) =>
            currentItem.cartId === newCartId
              ? {
                  ...currentItem,
                  quantity:
                    currentItem.quantity + item.quantity,
                }
              : currentItem
          );
      }

      return items.map((currentItem) =>
        currentItem.cartId === cartId
          ? {
              ...currentItem,
              [option]: value,
              cartId: newCartId,
            }
          : currentItem
      );
    });
  };

  // CLEAR CART
  const clearCart = () => {
    setCartItems([]);
  };

  // TOTAL ITEMS
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + (Number(item.quantity) || 0),
    0
  );

  // SUBTOTAL
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
        (Number(item.quantity) || 0),
    0
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
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
};