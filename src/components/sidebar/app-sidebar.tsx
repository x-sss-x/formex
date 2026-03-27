"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { Sidebar } from "../ui/sidebar";

export function AppSidebar({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { programId } = useParams<{ programId: string }>();
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row duration-100"
      style={
        programId
          ? ({
              "--sidebar-width": "calc(16rem*2)",
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      {children}
    </Sidebar>
  );
}
