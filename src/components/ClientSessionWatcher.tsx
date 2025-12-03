"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

export function ClientSessionWatcher({ interval = 30000 }) {
  const lastSessionVersion = useRef<string | number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const session = await res.json();

        if (!session || !session.user) {
          signOut({ callbackUrl: "/login" });
          return;
        }

        if (lastSessionVersion.current === null) {
          lastSessionVersion.current = session.user.sessionVersion;
          return;
        }

        if (session.user.sessionVersion !== lastSessionVersion.current) {
          signOut({ callbackUrl: "/login" });
          return;
        }
      } catch (e) {
        console.error("Auto logout check failed:", e);
      }
    }

    checkSession();
    timer = setInterval(checkSession, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return null;
}
