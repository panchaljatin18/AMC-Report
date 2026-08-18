"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { apiUrl, getApiHeaders } from "../utils/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { },
  logout: () => { },
});

// Ephemeral session storage keys (purged immediately when tab or browser closes)
const STORAGE_TOKEN_KEY = "amc_ccrs_session_token";
const STORAGE_USER_KEY = "amc_ccrs_session_user";

// 15-minute inactivity auto-logout watchdog (in milliseconds)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem("amc_ccrs_auth_token");
      localStorage.removeItem("amc_ccrs_auth_user");
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      fetch(apiUrl("/api/auth/logout"), { method: "POST" }).catch(() => { });
    } catch { }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    try {
      localStorage.removeItem("amc_ccrs_auth_token");
      localStorage.removeItem("amc_ccrs_auth_user");

      const savedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);
      const savedUserStr = sessionStorage.getItem(STORAGE_USER_KEY);
      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      }
    } catch (e) {
      console.error("Session restore error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetInactivityTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [token, resetInactivityTimer]);

  const login = async (username, password) => {
    const trimmedUser = (username || "").trim();
    const trimmedPass = (password || "").trim();

    if (!trimmedPass) {
      throw new Error("Please enter your password.");
    }

    const res = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
    });

    if (!res.ok) {
      let msg = "Invalid Password. Please verify your credentials.";
      try {
        const errData = await res.json();
        if (errData && errData.detail) {
          msg = errData.detail;
        }
      } catch { }
      throw new Error(msg);
    }

    const data = await res.json();
    const authToken = data.token;
    const authUser = data.user;

    if (!authToken || !authUser) {
      throw new Error("Invalid response from authentication server.");
    }

    setToken(authToken);
    setUser(authUser);

    // Save only to ephemeral sessionStorage
    sessionStorage.setItem(STORAGE_TOKEN_KEY, authToken);
    sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));

    return { success: true, token: authToken, user: authUser };
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
