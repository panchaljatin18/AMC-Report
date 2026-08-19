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

export function getApiHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey.trim();
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function downloadFile(path, defaultFilename = "download.pptx") {
  const url = apiUrl(path);
  let finalUrl = url;
  
  // Attach token or api_key as query param for fallback
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const paramKey = apiKey ? `api_key=${encodeURIComponent(apiKey)}` : (token ? `token=${encodeURIComponent(token)}` : "");
    if (paramKey) {
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + paramKey;
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

