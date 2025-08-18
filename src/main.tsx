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

// Minimal PWA service worker registration (if present)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((_e) => {
      /* ignore */
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
