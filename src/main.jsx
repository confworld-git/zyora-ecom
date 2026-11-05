import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { ProductProvider } from "./Context/ProductContext.jsx";
import { WishlistProvider } from "./Context/WishlistContext";
import { HelmetProvider } from "react-helmet-async";

const rootElement = document.getElementById("root");
const initialProducts = window.__ZYORA_INITIAL_PRODUCTS__ ?? null;
const app = (
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ProductProvider initialProducts={initialProducts}>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
