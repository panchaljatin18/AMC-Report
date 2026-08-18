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

// Official credentials fallback
const DEFAULT_USER = "Jatin Panchal";
const DEFAULT_PASS = "Jatin@1234";

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
    const trimmedUser = (username || "").trim();
    const trimmedPass = (password || "").trim();

    let authToken = null;
    let authUser = null;

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: getApiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        authUser = data.user;
      } else if (res.status === 401) {
        let msg = "Invalid Password. Please enter the correct password.";
        try {
          const errData = await res.json();
          msg = errData.detail || msg;
        } catch {}
        throw new Error(msg);
      } else {
        // Fallback for 404 (e.g. backend deploy in progress)
        const isUserMatch = trimmedUser.toLowerCase() === DEFAULT_USER.toLowerCase();
        const isPassMatch = trimmedPass === DEFAULT_PASS;
        if (isUserMatch && isPassMatch) {
          authToken = `amc_local_token_${Date.now()}`;
          authUser = {
            name: DEFAULT_USER,
            username: DEFAULT_USER,
            role: "Chief System Administrator",
            department: "AMC CCRS Command & Control",
            authenticated: true,
          };
        } else {
          throw new Error("Invalid Password. Please verify your credentials.");
        }
      }
    } catch (networkOrApiErr) {
      if (networkOrApiErr.message && !networkOrApiErr.message.includes("Failed to fetch") && !networkOrApiErr.message.includes("NetworkError")) {
        throw networkOrApiErr;
      }

      // Offline / Backend Sleeping Graceful Fallback
      const isUserMatch = trimmedUser.toLowerCase() === DEFAULT_USER.toLowerCase();
      const isPassMatch = trimmedPass === DEFAULT_PASS;
      if (isUserMatch && isPassMatch) {
        authToken = `amc_local_token_${Date.now()}`;
        authUser = {
          name: DEFAULT_USER,
          username: DEFAULT_USER,
          role: "Chief System Administrator",
          department: "AMC CCRS Command & Control",
          authenticated: true,
        };
      } else {
        throw new Error("Invalid Password. Please verify your credentials.");
      }
    }

    if (!authToken || !authUser) {
      throw new Error("Authentication failed. Please verify your credentials.");
    }

    setToken(authToken);
    setUser(authUser);

    // Save to storage
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_TOKEN_KEY, authToken);
    storage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));

    return { success: true, token: authToken, user: authUser };
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
