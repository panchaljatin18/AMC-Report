// Centralized API configuration and authentication utility

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:8000";
  }
  return "https://amc-report.onrender.com";
}

export function apiUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("amc_ccrs_session_token") ||
    localStorage.getItem("amc_ccrs_session_token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("amc_ccrs_auth_token") ||
    localStorage.getItem("amc_ccrs_auth_token")
  );
}

export function getApiHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey.trim();
  }
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function downloadFile(path, defaultFilename = "download.pptx") {
  const url = apiUrl(path);
  let finalUrl = url;
  
  // Attach token or api_key as query param for fallback / direct browser access
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const queryParams = [];
    if (apiKey) {
      queryParams.push(`api_key=${encodeURIComponent(apiKey)}`);
    }
    if (token) {
      queryParams.push(`token=${encodeURIComponent(token)}`);
    }
    if (queryParams.length > 0) {
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryParams.join("&");
    }
  }

  try {
    const res = await fetch(finalUrl, {
      method: "GET",
      headers: getApiHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Failed to download file (${res.status})`);
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed, opening fallback URL:", err);
    window.open(finalUrl, "_blank");
  }
}

