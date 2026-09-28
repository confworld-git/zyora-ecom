import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/products/get_products`,
        );
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (requestError) {
        console.error("Error fetching products:", requestError);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  const getProductById = (productId) =>
    products.find(
      (product) => String(product.id ?? product._id) === String(productId),
    );

  return (
    <ProductContext.Provider
      value={{ products, loading, error, getProductById }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};
