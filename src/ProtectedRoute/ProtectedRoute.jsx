import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { customer, isLoggedIn, loading: customerLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        setAuthenticated(true);
      } catch (error) {
        console.log(error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading || customerLoading) {
    return <div className="route-loading">Checking authentication...</div>;
  }

  if (!authenticated) {
    if (isLoggedIn) {
      return <Navigate to={`/Profile/${customer.customerId}`} replace />;
    }

    return <Navigate to="/Login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
