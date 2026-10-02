import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

const CustomerRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="route-loading">Checking authentication...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
};

export default CustomerRoute;