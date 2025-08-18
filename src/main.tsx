import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Optional Sentry init
try {
  const dsn = (import.meta as any).env?.VITE_SENTRY_DSN;
  if (dsn) {
    // dynamic import to avoid bundling if not used
    import("@sentry/browser")
      .then((Sentry) => {
        Sentry.init({ dsn });
      })
      .catch((_e) => {
        /* ignore */
      });
  }
} catch (_e) {
  /* ignore */
}

// Robust service worker handling: enable only in production to avoid dev cache issues
const SW_VERSION = "v3";
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = `/sw.js?v=${SW_VERSION}`;
    navigator.serviceWorker.register(swUrl).catch((_e) => {
      /* ignore */
    });
  });
} else if ("serviceWorker" in navigator) {
  // In development, unregister any existing SW and clear caches to prevent stale module issues
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.unregister();
  });
  if ("caches" in window) {
    caches.keys().then((keys) => {
      for (const key of keys) {
        if (key.startsWith("ow-cache-")) caches.delete(key);
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
