// Centralized API configuration utility

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    // Connect directly to FastAPI on port 8000 (works on localhost & LAN IPs)
    const hostname = window.location.hostname || "127.0.0.1";
    return `http://${hostname}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
