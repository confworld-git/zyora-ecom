import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ProductProvider } from "./Context/ProductContext.jsx";
import { WishlistProvider } from "./Context/WishlistContext.jsx";
import { CartProvider } from "./Context/CartContext.jsx";

import { AppRoutes } from "./App.jsx";

export function render(url, initialProducts = null) {
  const helmetContext = {};

  const app = (
    <HelmetProvider context={helmetContext}>
      <ProductProvider initialProducts={initialProducts}>
        <WishlistProvider>
          <CartProvider>
            <StaticRouter location={url}>
              <AppRoutes />
            </StaticRouter>
          </CartProvider>
        </WishlistProvider>
      </ProductProvider>
    </HelmetProvider>
  );

  const html = renderToString(app);

  return {
    html,
    helmet: helmetContext.helmet || null,
  };
}
