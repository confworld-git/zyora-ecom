import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { ProductProvider } from "./Context/ProductContext.jsx";
import { WishlistProvider } from "./Context/WishlistContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProductProvider>
      <WishlistProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </WishlistProvider>
    </ProductProvider>
  </StrictMode>,
);
