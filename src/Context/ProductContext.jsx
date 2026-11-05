
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const ProductContext = createContext(null);

const REFRESH_INTERVAL = 60 * 1000;

export const ProductProvider = ({
  children,
  initialProducts = null,
}) => {
  const hasInitialProducts = Array.isArray(initialProducts);

  const [products, setProducts] = useState(
    hasInitialProducts ? initialProducts : [],
  );

  const [loading, setLoading] = useState(!hasInitialProducts);
  const [error, setError] = useState("");

  // Fetch the latest products from the backend.
  const fetchProducts = useCallback(async () => {
    return axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/products/get_products`,
      {
        params: {
          _t: Date.now(),
        },
        headers: {
          "Cache-Control": "no-cache",
        },
      },
    );
  }, []);

  // Refresh product data.
  const refreshProducts = useCallback(async () => {
    try {
      const response = await fetchProducts();

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid products API response");
      }

      setProducts(response.data);
      setError("");

      return true;
    } catch (requestError) {
      console.error("Error refreshing products:", requestError);
      setError("Unable to load products.");

      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Always fetch the latest products, including during SSG hydration.
  useEffect(() => {
    let cancelled = false;
    let isFetching = false;

    const loadProducts = async () => {
      if (isFetching) return;

      isFetching = true;

      try {
        const response = await fetchProducts();

        if (cancelled) return;

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid products API response");
        }

        setProducts(response.data);
        setError("");
      } catch (requestError) {
        if (cancelled) return;

        console.error("Error fetching products:", requestError);

        // Keep existing SSG products if the API fails.
        setError("Unable to load products.");
      } finally {
        isFetching = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Fetch fresh products immediately after mounting.
    loadProducts();

    // Refresh when the customer returns to the browser tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    // Automatically refresh every 60 seconds.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.clearInterval(intervalId);
    };
  }, [fetchProducts]);

  // Find a product using its ID.
  const getProductById = useCallback(
    (productId) =>
      products.find(
        (product) =>
          String(product.id ?? product._id) === String(productId),
      ),
    [products],
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        getProductById,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};
