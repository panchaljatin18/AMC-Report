// Centralized API configuration and authentication utility

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getApiHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey.trim();
  }
  return headers;
}
