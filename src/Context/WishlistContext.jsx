import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useProducts } from "./ProductContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = "zyora_wishlist";
const WISHLIST_OWNER_STORAGE_KEY = "zyora_wishlist_owner";
const API = import.meta.env.VITE_API_BASE_URL;

const getProductImage = (product) => {
  const image = product.images?.[0] || product.image;
  return typeof image === "string" ? image : image?.url || "";
};

const createWishlistItem = (product, selectedImage = "") => ({
  id: product.id ?? product._id,
  productMongoId: String(product._id ?? product.id),
  name: product.name || product.title || "Product",
  title: product.title,
  brand: product.brand,
  image: selectedImage || getProductImage(product),
  colors: product.variants?.colours || product.colors || [],
  sizes: product.variants?.sizes || product.sizes || [],
  price:
    Number(
      typeof product.price === "object"
        ? product.price?.selling_price
        : product.price,
    ) || 0,
  mrp:
    Number(
      typeof product.price === "object" ? product.price?.mrp : product.mrp,
    ) || 0,
  discountPercent:
    Number(
      typeof product.price === "object"
        ? product.price?.discount_percent
        : (product.discountPercent ?? product.discount_percent),
    ) || 0,
});

export const WishlistProvider = ({ children }) => {
  const { getProductById, loading: productsLoading } = useProducts();
  const { customer, isLoggedIn, loading: authLoading } = useAuth();
  const customerId = customer?.id ? String(customer.id) : null;
  const [wishlistItems, setWishlistItems] = useState(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse saved wishlist:", error);
      return [];
    }
  });

  const wishlistItemsRef = useRef(wishlistItems);
  const activeCustomerRef = useRef(null);
  const syncedCustomerRef = useRef(null);
  const syncingCustomerRef = useRef(null);
  const saveQueueRef = useRef(Promise.resolve());
  const [syncingCustomerId, setSyncingCustomerId] = useState(null);
  const [syncedCustomerId, setSyncedCustomerId] = useState(null);

  const isWishlistSyncing =
    isLoggedIn &&
    !authLoading &&
    !productsLoading &&
    syncingCustomerId === customerId;

  useEffect(() => {
    wishlistItemsRef.current = wishlistItems;
  }, [wishlistItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistItems),
      );
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  }, [wishlistItems]);

  // Load a customer's wishlist and merge guest favorites on first sign-in.
  useEffect(() => {
    if (authLoading || productsLoading) return;

    if (!isLoggedIn || !customerId) {
      let hasSignedInCache = Boolean(activeCustomerRef.current);
      try {
        hasSignedInCache ||= Boolean(
          localStorage.getItem(WISHLIST_OWNER_STORAGE_KEY),
        );
      } catch (error) {
        console.error("Failed to inspect the wishlist cache owner:", error);
      }

      if (hasSignedInCache) {
        activeCustomerRef.current = null;
        syncedCustomerRef.current = null;
        setWishlistItems([]);
        try {
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
          localStorage.removeItem(WISHLIST_OWNER_STORAGE_KEY);
        } catch (error) {
          console.error("Failed to clear the signed-in wishlist cache:", error);
        }
      }
      return;
    }

    if (syncedCustomerRef.current === customerId) return;

    activeCustomerRef.current = customerId;
    syncedCustomerRef.current = null;
    syncingCustomerRef.current = customerId;
    let cancelled = false;

    const syncWishlist = async () => {
      if (cancelled) return;
      setSyncingCustomerId(customerId);

      try {
        const storedOwner = localStorage.getItem(WISHLIST_OWNER_STORAGE_KEY);
        const guestItems =
          !storedOwner && wishlistItemsRef.current.length > 0
            ? wishlistItemsRef.current
            : [];

        if (storedOwner && storedOwner !== customerId) {
          setWishlistItems([]);
          localStorage.setItem(WISHLIST_STORAGE_KEY, "[]");
        }

        const response = await axios.get(`${API}/api/wishlist`, {
          withCredentials: true,
        });
        if (cancelled) return;

        let serverItems = response.data.items || [];

        if (guestItems.length > 0) {
          const items = guestItems
            .map((item) => {
              const product = getProductById(item.id);
              const productId = product?.id ?? item.id;
              if (!productId) return null;

              return {
                productId: String(productId),
                selectedImage: item.image || "",
              };
            })
            .filter(Boolean);

          if (items.length > 0) {
            const merged = await axios.post(
              `${API}/api/wishlist/merge`,
              { items },
              { withCredentials: true },
            );
            serverItems = merged.data.items || [];
          }
        }

        if (cancelled) return;

        const nextItems = serverItems
          .filter((item) => item.product)
          .map((item) => ({
            ...createWishlistItem(
              item.product,
              item.selectedImage || "",
            ),
            productMongoId: String(item.product._id ?? item.productId),
          }));

        localStorage.setItem(WISHLIST_OWNER_STORAGE_KEY, customerId);
        syncedCustomerRef.current = customerId;
        setSyncedCustomerId(customerId);
        setWishlistItems(nextItems);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to sync wishlist with the server:", error);
        toast.error(
          "Unable to sync your favorites. Your local favorites are unchanged.",
        );
      } finally {
        if (!cancelled) {
          syncingCustomerRef.current = null;
          setSyncingCustomerId(null);
        }
      }
    };

    Promise.resolve().then(syncWishlist);

    return () => {
      cancelled = true;
      if (syncingCustomerRef.current === customerId) {
        syncingCustomerRef.current = null;
      }
    };
  }, [
    authLoading,
    customerId,
    getProductById,
    isLoggedIn,
    productsLoading,
  ]);

  // Persist every signed-in wishlist update in order.
  useEffect(() => {
    if (
      !customerId ||
      syncedCustomerId !== customerId ||
      syncedCustomerRef.current !== customerId
    ) {
      return;
    }

    const items = wishlistItems
      .map((item) => {
        const product = getProductById(item.id);
        const productId = product?.id ?? item.id;
        if (!productId) return null;

        return {
          productId: String(productId),
          selectedImage: item.image || "",
        };
      })
      .filter(Boolean);

    saveQueueRef.current = saveQueueRef.current
      .catch(() => {})
      .then(() => {
        if (syncedCustomerRef.current !== customerId) return undefined;

        return axios.put(
          `${API}/api/wishlist`,
          { items },
          { withCredentials: true },
        );
      })
      .catch((error) => {
        console.error("Failed to save wishlist to the server:", error);
        toast.error(
          "Unable to save your favorites. Your local favorites are unchanged.",
        );
      });
  }, [customerId, getProductById, syncedCustomerId, wishlistItems]);

  const addToWishlist = (productOrId, selectedImage) => {
    if (syncingCustomerRef.current === customerId) return false;

    const product =
      typeof productOrId === "object" && productOrId !== null
        ? productOrId
        : getProductById(productOrId);
    const productId = product?.id ?? product?._id;
    if (!product || !productId) return false;

    const wishlistItem = createWishlistItem(product, selectedImage);

    setWishlistItems((currentItems) => {
      if (
        currentItems.some(
          (item) => String(item.id) === String(productId),
        )
      ) {
        return currentItems;
      }

      return [...currentItems, wishlistItem];
    });

    return true;
  };

  const removeFromWishlist = (productId) => {
    if (syncingCustomerRef.current === customerId) return;

    setWishlistItems((items) =>
      items.filter((item) => String(item.id) !== String(productId)),
    );
  };

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => String(item.id) === String(productId));

  const toggleWishlist = (productOrId, selectedImage) => {
    if (syncingCustomerRef.current === customerId) return false;

    const productId =
      typeof productOrId === "object" && productOrId !== null
        ? (productOrId.id ?? productOrId._id)
        : productOrId;
    if (!productId) return false;

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
      return true;
    }

    return addToWishlist(productOrId, selectedImage);
  };

  const clearWishlist = () => {
    if (syncingCustomerRef.current === customerId) return;
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        isWishlistSyncing,
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

// Context modules export both their provider and hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
};
