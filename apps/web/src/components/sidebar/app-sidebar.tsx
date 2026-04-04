import type { ReactNode } from "react";
import { Sidebar } from "../ui/sidebar";

export function AppSidebar({ children }: { children: ReactNode }) {
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
    >
      {children}
    </Sidebar>
  );
}
