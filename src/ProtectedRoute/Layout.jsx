import { useCallback, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import ScrollToElementContext from "./ScrollToElementContext.js";

const Layout = () => {
  const location = useLocation();
  const lenisRef = useRef(null);
  const path = location.pathname.toLowerCase();

  const isAdminPage = path === "/login" || path.startsWith("/dashboard");
  const isPaymentResultPage =
    path === "/payment_result" || path === "/payment_failure";
  // matches /profile and /profile/<customerId> (path is already lowercase)
  const isProfilePage = path === "/profile" || path.startsWith("/profile/");
  const hideChrome = isAdminPage || isPaymentResultPage || isProfilePage;
  const isStorefrontPage =
    !isAdminPage &&
    path !== "/jewellery" &&
    !path.startsWith("/jewellery/");
  const scrollToElement = useCallback((element) => {
    if (!element) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (lenisRef.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(element, {
        immediate: reduceMotion,
      });
      return;
    }

    element.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    document.body.classList.toggle("storefront-body", isStorefrontPage);
    return () => document.body.classList.remove("storefront-body");
  }, [isStorefrontPage]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || isAdminPage) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      autoRaf: true,
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isAdminPage]);

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      {!hideChrome && <Navbar />}
      <ScrollToElementContext.Provider value={scrollToElement}>
        <Outlet />
      </ScrollToElementContext.Provider>
      {!hideChrome && <Footer />}
    </>
  );
};

export default Layout;
