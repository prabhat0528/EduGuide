// src/context/Authcontext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// Backend base URL
axios.defaults.baseURL = "http://localhost:9000";
axios.defaults.withCredentials = true;

const AuthContext = createContext();

// -------------------- PROVIDER --------------------
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------- CHECK SESSION --------------------
  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // -------------------- SIGNUP --------------------
  const signup = async (formData) => {
    const res = await axios.post("/api/auth/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(res.data.user);

    return res.data;
  };

  // -------------------- LOGIN --------------------
  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    setUser(res.data.user);

    return res.data;
  };

  // -------------------- LOGOUT --------------------
  const logout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,    
        loading,
        signup,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
