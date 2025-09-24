"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          borderRadius: "8px",
          background: "var(--background)",
          color: "var(--foreground)",
        },
      }}
    />
  );
}
