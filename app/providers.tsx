"use client";

import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <Toaster expand richColors position="top-right" />
      {children}
    </NextUIProvider>
  );
}
