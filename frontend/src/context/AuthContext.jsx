"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiUrl, getApiHeaders } from "../utils/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

const STORAGE_TOKEN_KEY = "amc_ccrs_auth_token";
const STORAGE_USER_KEY = "amc_ccrs_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session on mount
    try {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY);
      const savedUserStr = localStorage.getItem(STORAGE_USER_KEY) || sessionStorage.getItem(STORAGE_USER_KEY);
      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password, rememberMe = true) => {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
    });

    if (!res.ok) {
      let msg = "Invalid Username or Password";
      try {
        const errData = await res.json();
        msg = errData.detail || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json();
    const authToken = data.token;
    const authUser = data.user;

    setToken(authToken);
    setUser(authUser);

    // Save to storage
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_TOKEN_KEY, authToken);
    storage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      fetch(apiUrl("/api/auth/logout"), { method: "POST" }).catch(() => {});
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
