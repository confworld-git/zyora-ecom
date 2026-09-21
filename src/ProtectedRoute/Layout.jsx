import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";

const Layout = () => {
  const location = useLocation();

  const isAdminPage =
    location.pathname === "/Login" ||
    location.pathname.startsWith("/Dashboard");

  return (
    <>
      {!isAdminPage && <Navbar />}
      <Outlet />
      {!isAdminPage && <Footer />}
    </>
  );
};

export default Layout;
