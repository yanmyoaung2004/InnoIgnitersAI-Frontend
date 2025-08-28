"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("innoreigniters_credentials");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", {
        email: email,
        password: password,
      });

      if (res.status === 200) {
        localStorage.setItem(
          "innoreigniters_credentials",
          JSON.stringify(res.data)
        );
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const register = async (email, password) => {
    try {
      const res = await axios.post("/auth/signup", {
        email: email,
        password: password,
      });

      if (res.status === 200) {
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
