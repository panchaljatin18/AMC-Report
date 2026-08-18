"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { apiUrl, getApiHeaders } from "../utils/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

// Strictly ephemeral session storage key (destroyed immediately upon closing tab/browser)
const STORAGE_TOKEN_KEY = "amc_ccrs_session_token";
const STORAGE_USER_KEY = "amc_ccrs_session_user";

// Official municipal credentials
const DEFAULT_USER = "Jatin Panchal";
const DEFAULT_PASS = "Jatin@1234";

// 15-minute inactivity auto-logout timeout (in milliseconds)
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
      // Clear all ephemeral session storage
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      // Clean any legacy persistent storage for maximum security
      localStorage.removeItem("amc_ccrs_auth_token");
      localStorage.removeItem("amc_ccrs_auth_user");
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      fetch(apiUrl("/api/auth/logout"), { method: "POST" }).catch(() => {});
    } catch {}
  }, []);

  // Inactivity auto-lock watchdog
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    // Check ephemeral session on mount
    try {
      // Wipe any legacy localStorage to ensure tab-close auto-logout works strictly
      localStorage.removeItem("amc_ccrs_auth_token");
      localStorage.removeItem("amc_ccrs_auth_user");

      const savedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);
      const savedUserStr = sessionStorage.getItem(STORAGE_USER_KEY);
      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for user activity to maintain active session and auto-logout on idle
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
          authToken = `amc_session_token_${Date.now()}`;
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
        authToken = `amc_session_token_${Date.now()}`;
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

    // Save ONLY to sessionStorage (automatically purged by browser when tab/window is closed)
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
