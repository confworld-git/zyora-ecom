import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const ProductContext = createContext(null);

export const ProductProvider = ({ children, initialProducts = null }) => {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/get_products`,
      );
      setProducts(Array.isArray(response.data) ? response.data : []);
      setError("");
      return true;
    } catch (requestError) {
      console.error("Error refreshing products:", requestError);
      setError("Unable to load products.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // During SSG, products are already provided.
    if (initialProducts) {
      return;
    }

    refreshProducts();
  }, [initialProducts, refreshProducts]);

  const getProductById = (productId) =>
    products.find(
      (product) => String(product.id ?? product._id) === String(productId),
    );

  return (
    <ProductContext.Provider
      value={{ products, loading, error, getProductById, refreshProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// Context modules export both their provider and hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};
