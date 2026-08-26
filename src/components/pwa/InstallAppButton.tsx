"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Chrome/Android fires `beforeinstallprompt` when the manifest + service
 * worker criteria are met — we capture it and trigger it ourselves so the
 * button can live wherever we want instead of relying on the browser's own
 * install UI. iOS Safari never fires that event at all (no programmatic
 * install exists there), so it gets its own "how to" popover instead. */
export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    // Reading external browser state (matchMedia, navigator) after mount,
    // not synchronizing React state to itself — display-mode and UA aren't
    // available during SSR, so this can't run during render.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(standalone);
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !standalone);

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!deferredPrompt && !isIos)) return null;

  async function install() {
    if (isIos) {
      setShowIosHelp((v) => !v);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="relative">
      <button onClick={install} className="flex items-center gap-1 text-[#f3ede2] hover:text-[#f6c667]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Install App
      </button>

      {showIosHelp && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowIosHelp(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-[#f3ede2]/20 bg-[#241a5e] p-3 text-xs normal-case text-[#f3ede2] shadow-xl">
            <p>
              In Safari, tap the Share icon, then <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
            <button
              onClick={() => setShowIosHelp(false)}
              className="mt-2 text-[#f6c667] hover:underline"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </div>
  );
}
