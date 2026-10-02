import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true); // true until first session check finishes

  // Ask the backend who is logged in (cookie is sent automatically)
  const refresh = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/auth/customer-me`, {
        withCredentials: true,
      });
      setCustomer(res.data.customer);
      return res.data.customer;
    } catch {
      setCustomer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API}/api/auth/customer-logout`,
        {},
        { withCredentials: true },
      );
    } catch {
      // cookie may already be expired; clear local state anyway
    }
    setCustomer(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{ customer, isLoggedIn: !!customer, loading, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// Context modules export both their provider and hook.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
