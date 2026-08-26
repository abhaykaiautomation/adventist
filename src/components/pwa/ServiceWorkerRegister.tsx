"use client";

import { useEffect } from "react";

/** Registers the (deliberately minimal) service worker once on mount — a
 * plain side effect, not something any component needs to read state from,
 * so it renders nothing. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed", err);
    });
  }, []);

  return null;
}
