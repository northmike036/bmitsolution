"use client";

import { toast } from "sonner";

export function useToast() {
  return {
    toast: (options: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "info" | "warning";
      duration?: number;
    }) => {
      toast(options.title, {
        description: options.description,
        duration: options.duration ?? 3000,
        className:
          options.variant === "destructive"
            ? "bg-red-500 text-white"
            : options.variant === "success"
            ? "bg-green-500 text-white"
            : options.variant === "info"
            ? "bg-blue-500 text-white"
            : options.variant === "warning"
            ? "bg-yellow-500 text-black"
            : "",
      });
    },
  };
}
