"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UNLOCK_STORAGE_KEY } from "@/lib/config";

export type UnlockStatus = "checking" | "locked" | "unlocked";

/**
 * Asks the server whether this visitor has paid.
 *
 * What's kept in the browser is a Stripe Checkout session id, not a flag. It
 * gets re-verified against Stripe on every load, so editing localStorage by
 * hand gains you nothing — you'd need an id belonging to a real completed
 * payment, and those only ever go to the person who made it.
 */
async function verify(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { unlocked?: boolean };
    return data.unlocked === true;
  } catch {
    return false;
  }
}

function stripSessionFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("session_id")) return;
  url.searchParams.delete("session_id");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

async function resolveUnlock(): Promise<boolean> {
  const fromUrl = new URLSearchParams(window.location.search).get("session_id");
  const stored = window.localStorage.getItem(UNLOCK_STORAGE_KEY);
  const sessionId = fromUrl ?? stored;

  if (!sessionId) return false;

  const ok = await verify(sessionId);

  if (ok) {
    window.localStorage.setItem(UNLOCK_STORAGE_KEY, sessionId);
  } else if (stored) {
    // A stored id that no longer checks out is just clutter.
    window.localStorage.removeItem(UNLOCK_STORAGE_KEY);
  }

  // Tidy the address bar either way, so the id isn't sitting in the URL to be
  // copied into a group chat.
  stripSessionFromUrl();

  return ok;
}

export function useUnlock() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const pendingRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const promise = resolveUnlock();
    pendingRef.current = promise;
    void promise.then((ok) => {
      if (!cancelled) setUnlocked(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Awaits the in-flight check. Dropping a ZIP a fraction of a second after
   * the page loads shouldn't quietly bill someone the 20-file limit.
   */
  const settled = useCallback(async (): Promise<boolean> => {
    return (await pendingRef.current) ?? false;
  }, []);

  const status: UnlockStatus =
    unlocked === null ? "checking" : unlocked ? "unlocked" : "locked";

  return { status, unlocked: unlocked === true, settled };
}

/** Starts a Stripe Checkout session and sends the browser to it. */
export async function startCheckout(): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      return data.error ?? "Couldn't start checkout. Try again in a moment.";
    }
    window.location.href = data.url;
    return null;
  } catch {
    return "Couldn't reach the checkout. Check your connection and try again.";
  }
}
