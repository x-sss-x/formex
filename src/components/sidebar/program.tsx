"use client";

import { HomeIcon } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export function ProgramSidebar() {
  return (
    <Sidebar collapsible="none" className="hidden peer flex-1 md:flex">
      <SidebarHeader>
        <span className="text-lg px-1.5 font-semibold font-heading">
          Program
        </span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem>
            <Link href={"/"}>
              <SidebarMenuButton>
                <HomeIcon /> Students
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
