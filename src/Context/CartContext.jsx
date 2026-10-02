import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useProducts } from "./ProductContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "zyora_cart";
const CART_OWNER_STORAGE_KEY = "zyora_cart_owner";
const API = import.meta.env.VITE_API_BASE_URL;

const getProductImage = (product, color) => {
  const colorIndex = product.variants?.colours?.indexOf(color) ?? -1;

  const image =
    colorIndex >= 0
      ? product.images?.[colorIndex]
      : product.images?.[0] || product.image;

  return typeof image === "string" ? image : image?.url || "";
};

const capCartItemsToProductStock = (items) => {
  const quantitiesByProduct = new Map();

  return items
    .map((item) => {
      const productId = String(item.id);
      const stockQuantity = Number(item.stock?.quantity) || 0;
      const inStock = item.stock?.in_stock === true;
      const alreadyInCart = quantitiesByProduct.get(productId) || 0;
      const quantity = inStock
        ? Math.min(
            Number(item.quantity) || 1,
            Math.max(0, stockQuantity - alreadyInCart),
          )
        : 0;

      quantitiesByProduct.set(productId, alreadyInCart + quantity);

      return {
        ...item,
        quantity,
      };
    })
    .filter((item) => item.quantity > 0);
};

export const CartProvider = ({ children }) => {
  const {
    getProductById,
    loading: productsLoading,
    products,
  } = useProducts();
  const { customer, isLoggedIn, loading: authLoading } = useAuth();

  const customerId = customer?.id ? String(customer.id) : null;

  const [cartItems, setCartItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to parse saved cart:", err);
      return [];
    }
  });

  const cartItemsRef = useRef(cartItems);
  const activeCustomerRef = useRef(null);
  const syncedCustomerRef = useRef(null);
  const cartSyncingCustomerRef = useRef(null);

  const [cartSyncingCustomerId, setCartSyncingCustomerId] = useState(null);
  const [syncedCustomerId, setSyncedCustomerId] = useState(null);

  const saveQueueRef = useRef(Promise.resolve());

  const updateCartItems = useCallback((update) => {
    const currentItems = cartItemsRef.current;
    const nextItems = update(currentItems);

    if (nextItems !== currentItems) {
      cartItemsRef.current = nextItems;
      setCartItems(nextItems);
    }

    return nextItems;
  }, []);

  const isCartSyncing =
    isLoggedIn &&
    !authLoading &&
    !productsLoading &&
    cartSyncingCustomerId === customerId;

  // Keep cart ref updated
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  useEffect(() => {
    if (productsLoading || cartItemsRef.current.length === 0) return;

    const currentItems = cartItemsRef.current;
    const withCurrentStock = currentItems.map((item) => {
      const product = getProductById(item.id);
      if (!product) return item;

      return {
        ...item,
        stock: {
          in_stock: product.stock?.in_stock === true,
          quantity: Number(product.stock?.quantity) || 0,
        },
      };
    });
    const nextItems = capCartItemsToProductStock(withCurrentStock);

    if (
      nextItems.length !== currentItems.length ||
      nextItems.some(
        (item, index) => item.quantity !== currentItems[index].quantity,
      )
    ) {
      toast.warning("Your cart was updated to match available stock.");
      updateCartItems(() => nextItems);
    }
  }, [getProductById, products, productsLoading, updateCartItems]);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cartItems]);

  // Load the signed-in customer's cart and merge guest cart exactly once.
  useEffect(() => {
    if (authLoading || productsLoading) return;

    // User is not logged in
    if (!isLoggedIn || !customerId) {
      let hasSignedInCache = Boolean(activeCustomerRef.current);

      try {
        hasSignedInCache ||= Boolean(
          localStorage.getItem(CART_OWNER_STORAGE_KEY),
        );
      } catch (error) {
        console.error("Failed to inspect the cart cache owner:", error);
      }

      if (hasSignedInCache) {
        activeCustomerRef.current = null;
        syncedCustomerRef.current = null;

        updateCartItems(() => []);

        try {
          localStorage.removeItem(CART_STORAGE_KEY);
          localStorage.removeItem(CART_OWNER_STORAGE_KEY);
        } catch (error) {
          console.error(
            "Failed to clear the signed-in cart cache:",
            error,
          );
        }
      }

      return;
    }

    if (syncedCustomerRef.current === customerId) {
      return;
    }

    activeCustomerRef.current = customerId;
    syncedCustomerRef.current = null;
    cartSyncingCustomerRef.current = customerId;

    let cancelled = false;

    const syncCart = async () => {
      if (cancelled) return;

      setCartSyncingCustomerId(customerId);

      try {
        const storedOwner = localStorage.getItem(
          CART_OWNER_STORAGE_KEY,
        );

        const guestItems =
          !storedOwner && cartItemsRef.current.length > 0
            ? cartItemsRef.current
            : [];

        if (storedOwner && storedOwner !== customerId) {
          updateCartItems(() => []);
          localStorage.setItem(CART_STORAGE_KEY, "[]");
        }

        // Get customer's cart from backend
        const response = await axios.get(`${API}/api/cart`, {
          withCredentials: true,
        });

        if (cancelled) return;

        let serverItems = response.data.items || [];

        // Merge guest cart
        if (guestItems.length > 0) {
          const items = guestItems
            .map((item) => {
              const product = getProductById(item.id);
              const productId = product?.id ?? item.id;

              if (!productId) {
                return null;
              }

              return {
                ...item,
                id: String(productId),
                stock: {
                  in_stock: product?.stock?.in_stock === true,
                  quantity: Number(product?.stock?.quantity) || 0,
                },
                color:
                  item.color === "Not specified"
                    ? ""
                    : item.color,
                size:
                  item.size === "Not specified"
                    ? ""
                    : item.size,
              };
            })
            .filter(Boolean);

          const cappedItems = capCartItemsToProductStock(items).map(
            (item) => ({
              productId: item.id,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
            }),
          );

          if (cappedItems.length > 0) {
            const merged = await axios.post(
              `${API}/api/cart/merge`,
              { items: cappedItems },
              { withCredentials: true },
            );

            serverItems = merged.data.items || [];
          }
        }

        if (cancelled) return;

        // Convert backend cart into frontend cart structure
        const nextCart = capCartItemsToProductStock(serverItems
          .filter((item) => item.product)
          .map((item) => {
            const product = item.product;

            const id =
              product.id ?? String(product._id);

            const color =
              item.color || "Not specified";

            const size =
              item.size || "Not specified";

            const colors =
              product.variants?.colours || [];

            const sizes =
              product.variants?.sizes || [];

            const stockQuantity =
              Number(product.stock?.quantity) || 0;

            const isInStock =
              product.stock?.in_stock === true;

            return {
              cartId: `${String(id)}-${color}-${size}`,

              id,

              productMongoId: String(
                product._id ?? item.productId,
              ),

              name:
                product.name ||
                product.title ||
                "Product",

              title: product.title,

              brand: product.brand,

              image: getProductImage(
                product,
                color,
              ),

              colors,
              sizes,

              price:
                Number(
                  product.price?.selling_price,
                ) || 0,

              mrp:
                Number(product.price?.mrp) || 0,

              discountPercent:
                Number(
                  product.price?.discount_percent,
                ) || 0,

              color,
              size,

              stock: {
                in_stock: isInStock,
                quantity: stockQuantity,
              },

              quantity: Number(item.quantity) || 1,
            };
          }));

        localStorage.setItem(
          CART_OWNER_STORAGE_KEY,
          customerId,
        );

        syncedCustomerRef.current = customerId;

        setSyncedCustomerId(customerId);

        updateCartItems(() => nextCart);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Failed to sync cart with the server:",
          error,
        );

        toast.error(
          "Unable to sync your cart. Your local cart is unchanged.",
        );
      } finally {
        if (!cancelled) {
          cartSyncingCustomerRef.current = null;
          setCartSyncingCustomerId(null);
        }
      }
    };

    Promise.resolve().then(syncCart);

    return () => {
      cancelled = true;

      if (
        cartSyncingCustomerRef.current ===
        customerId
      ) {
        cartSyncingCustomerRef.current = null;
      }
    };
  }, [
    authLoading,
    customerId,
    getProductById,
    isLoggedIn,
    productsLoading,
    updateCartItems,
  ]);

  // Serialize updates so rapid cart changes cannot save out of order.
  useEffect(() => {
    if (
      !customerId ||
      syncedCustomerId !== customerId ||
      syncedCustomerRef.current !== customerId
    ) {
      return;
    }

    const items = capCartItemsToProductStock(cartItems
      .map((item) => {
        const product = getProductById(item.id);

        const productId =
          product?.id ?? item.id;

        if (!productId) {
          return null;
        }

        return {
          id: String(productId),
          quantity: item.quantity,
          stock: {
            in_stock: product?.stock?.in_stock === true,
            quantity: Number(product?.stock?.quantity) || 0,
          },
          color:
            item.color === "Not specified"
              ? ""
              : item.color,
          size:
            item.size === "Not specified"
              ? ""
              : item.size,
        };
      })
      .filter(Boolean)).map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));

    saveQueueRef.current = saveQueueRef.current
      .catch(() => {})
      .then(() => {
        if (
          syncedCustomerRef.current !==
          customerId
        ) {
          return undefined;
        }

        return axios.put(
          `${API}/api/cart`,
          { items },
          { withCredentials: true },
        );
      })
      .catch((error) => {
        console.error(
          "Failed to save cart to the server:",
          error,
        );

        toast.error(
          "Unable to save your cart. Your local cart is unchanged.",
        );
      });
  }, [
    cartItems,
    customerId,
    getProductById,
    syncedCustomerId,
  ]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const addToCart = (
    productOrId,
    selectedColor,
    selectedSize,
    selectedImage,
  ) => {
    if (
      cartSyncingCustomerRef.current ===
      customerId
    ) {
      return false;
    }

    const product =
      typeof productOrId === "object" &&
      productOrId !== null
        ? productOrId
        : getProductById(productOrId);

    const productId =
      product?.id ?? product?._id;

    if (!product || !productId) {
      return false;
    }

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
          : product.price,
      ) || 0;

    const mrp =
      Number(
        typeof product.price === "object"
          ? product.price?.mrp
          : product.mrp,
      ) || 0;

    const discountPercent =
      Number(
        typeof product.price === "object"
          ? product.price?.discount_percent
          : (
              product.discountPercent ??
              product.discount_percent
            ),
      ) || 0;

    const color =
      selectedColor || "Not specified";

    const size =
      selectedSize || "Not specified";

    // Same product + same color + same size
    // = same cart item
    const cartId = `${String(
      productId,
    )}-${color}-${size}`;

    const stockQuantity =
      Number(product.stock?.quantity) || 0;

    const isInStock =
      product.stock?.in_stock === true;

    // Product is out of stock
    if (!isInStock || stockQuantity <= 0) {
      toast.error("This product is currently out of stock.");
      return false;
    }

    const productQuantityInCart = cartItemsRef.current
      .filter((item) => String(item.id) === String(productId))
      .reduce((total, item) => total + (Number(item.quantity) || 0), 0);

    if (productQuantityInCart >= stockQuantity) {
      toast.warning(`Only ${stockQuantity} item(s) available in stock.`);
      return false;
    }

    const cartItem = {
      cartId,

      id: productId,

      productMongoId: String(
        product._id ?? productId,
      ),

      name:
        product.name ||
        product.title ||
        "Product",

      title: product.title,

      brand: product.brand,

      image:
        selectedImage ||
        getProductImage(
          product,
          color,
        ),

      colors,
      sizes,

      price,
      mrp,
      discountPercent,

      color,
      size,

      stock: {
        in_stock: isInStock,
        quantity: stockQuantity,
      },

      quantity: 1,
    };

    updateCartItems((currentItems) => {
      const currentProductQuantity = currentItems
        .filter((item) => String(item.id) === String(productId))
        .reduce((total, item) => total + (Number(item.quantity) || 0), 0);

      if (currentProductQuantity >= stockQuantity) {
        toast.warning(`Only ${stockQuantity} item(s) available in stock.`);
        return currentItems;
      }

      const existingItem =
        currentItems.find(
          (item) =>
            item.cartId === cartId,
        );

      // =====================================================
      // SAME PRODUCT + SAME VARIANT
      // =====================================================

      if (existingItem) {
        if (
          existingItem.quantity >=
          stockQuantity
        ) {
          toast.warning(
            `Only ${stockQuantity} item(s) available in stock.`,
          );

          return currentItems;
        }

        return currentItems.map(
          (item) =>
            item.cartId === cartId
              ? {
                  ...item,

                  image:
                    selectedImage ||
                    item.image,

                  stock: {
                    in_stock:
                      isInStock,
                    quantity:
                      stockQuantity,
                  },

                  quantity: Math.min(
                    stockQuantity,
                    item.quantity + 1,
                  ),
                }
              : item,
        );
      }

      // =====================================================
      // NEW PRODUCT / NEW VARIANT
      // =====================================================

      return [
        ...currentItems,
        cartItem,
      ];
    });

    return true;
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const increaseQuantity = (cartId) => {
    if (
      cartSyncingCustomerRef.current ===
      customerId
    ) {
      return;
    }

    updateCartItems((items) =>
      items.map((item) => {
        if (item.cartId !== cartId) {
          return item;
        }

        // Get latest product information
        const product =
          getProductById(item.id);

        const stockQuantity =
          Number(
            product?.stock?.quantity ??
              item.stock?.quantity,
          ) || 0;

        const isInStock =
          product?.stock?.in_stock ??
          item.stock?.in_stock ??
          false;

        const productQuantityInCart = items
          .filter((cartItem) => String(cartItem.id) === String(item.id))
          .reduce(
            (total, cartItem) =>
              total + (Number(cartItem.quantity) || 0),
            0,
          );

        if (
          !isInStock ||
          stockQuantity <= 0
        ) {
          toast.error(
            "This product is out of stock.",
          );

          return item;
        }

        if (
          productQuantityInCart >=
          stockQuantity
        ) {
          toast.error(
            `Only ${stockQuantity} item(s) available in stock.`,
          );

          return item;
        }

        return {
          ...item,

          stock: {
            in_stock: isInStock,
            quantity: stockQuantity,
          },

          quantity: Math.min(
            stockQuantity,
            item.quantity + 1,
          ),
        };
      }),
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const decreaseQuantity = (cartId) => {
    if (
      cartSyncingCustomerRef.current ===
      customerId
    ) {
      return;
    }

    updateCartItems((items) =>
      items
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item,
        )
        .filter(
          (item) =>
            item.quantity > 0,
        ),
    );
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeFromCart = (cartId) => {
    if (
      cartSyncingCustomerRef.current ===
      customerId
    ) {
      return;
    }

    updateCartItems((items) =>
      items.filter(
        (item) =>
          item.cartId !== cartId,
      ),
    );
  };

  // =========================================================
  // UPDATE SIZE / COLOR
  // =========================================================

  const updateCartItemOption = (
    cartId,
    option,
    value,
  ) => {
    if (
      cartSyncingCustomerRef.current ===
      customerId
    ) {
      return;
    }

    updateCartItems((items) => {
      const item = items.find(
        (currentItem) =>
          currentItem.cartId === cartId,
      );

      if (
        !item ||
        item[option] === value
      ) {
        return items;
      }

      const newColor =
        option === "color"
          ? value
          : item.color ||
            "Not specified";

      const newSize =
        option === "size"
          ? value
          : item.size ||
            "Not specified";

      const newCartId = `${String(
        item.id,
      )}-${newColor}-${newSize}`;

      const duplicate = items.find(
        (currentItem) =>
          currentItem.cartId ===
            newCartId &&
          currentItem.cartId !==
            cartId,
      );

      const product =
        getProductById(item.id);

      const stockQuantity =
        Number(
          product?.stock?.quantity,
        ) || 0;

      const isInStock =
        product?.stock?.in_stock ===
        true;

      // =====================================================
      // TARGET VARIANT ALREADY EXISTS
      // =====================================================

      if (duplicate) {
        if (
          !isInStock ||
          stockQuantity <= 0
        ) {
          toast.error(
            "This product is out of stock.",
          );

          return items;
        }

        const mergedQuantity =
          Math.min(
            stockQuantity,
            duplicate.quantity +
              item.quantity,
          );

        if (
          duplicate.quantity +
            item.quantity >
          stockQuantity
        ) {
          toast.error(
            `Only ${stockQuantity} item(s) available in stock.`,
          );
        }

        return items
          .filter(
            (currentItem) =>
              currentItem.cartId !==
              cartId,
          )
          .map((currentItem) =>
            currentItem.cartId ===
            newCartId
              ? {
                  ...currentItem,

                  stock: {
                    in_stock:
                      isInStock,
                    quantity:
                      stockQuantity,
                  },

                  quantity:
                    mergedQuantity,
                }
              : currentItem,
          );
      }

      // =====================================================
      // CHANGE TO NEW VARIANT
      // =====================================================

      if (
        !isInStock ||
        stockQuantity <= 0
      ) {
        toast.error(
          "This product is out of stock.",
        );

        return items;
      }

      const newQuantity = Math.min(
        item.quantity,
        stockQuantity,
      );

      if (
        item.quantity >
        stockQuantity
      ) {
        toast.error(
          `Only ${stockQuantity} item(s) available in stock.`,
        );
      }

      return items.map(
        (currentItem) =>
          currentItem.cartId ===
          cartId
            ? {
                ...currentItem,

                [option]: value,

                cartId: newCartId,

                stock: {
                  in_stock:
                    isInStock,
                  quantity:
                    stockQuantity,
                },

                quantity:
                  newQuantity,

                ...(option === "color"
                  ? {
                      image:
                        getProductImage(
                          product || {},
                          value,
                        ),
                    }
                  : {}),
              }
            : currentItem,
      );
    });
  };

  // =========================================================
  // CLEAR CART
  // =========================================================

  const clearCart = () => {
    updateCartItems(() => []);
  };

  // =========================================================
  // TOTAL ITEMS
  // =========================================================

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) ||
          0),
      0,
    );

  // =========================================================
  // SUBTOTAL
  // =========================================================

  const subtotal =
    cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.price) || 0) *
          (Number(item.quantity) ||
            0),
      0,
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartSyncing,

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

// Context modules export both provider and hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider",
    );
  }

  return context;
};