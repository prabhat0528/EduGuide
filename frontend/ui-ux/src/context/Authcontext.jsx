import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

axios.defaults.baseURL = "https://eduguide-backend-z81h.onrender.com";
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
     
      if (err.response?.status !== 401) console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signup = async (formData) => {
    const res = await axios.post("/api/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, signup, login, logout, checkAuth }}
    >
      
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);