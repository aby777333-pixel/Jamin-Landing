"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js after load (do-all round #2). Production only — a worker
 * caching localhost during development is a debugging hazard nobody asked
 * for. Registration failure is silent by design: the site without a worker
 * is exactly the site that existed yesterday.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    if (document.readyState === "complete") onLoad();
    else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);
  return null;
}
