"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "../ui/sidebar";
import { useParams } from "next/navigation";
import React from "react";

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const { programId } = useParams<{ programId?: string }>();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": programId ? "calc(16rem * 2)" : "16rem",
        } as React.CSSProperties
      }
      className="flex min-h-svh w-full"
    >
      {children}
    </SidebarProvider>
  );
}
