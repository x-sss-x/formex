"use client";

import {
  Calendar01Icon,
  GridIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { AppSidebarFooter } from "./app-sidebar-footer";

const items = {
  program: [
    { id: 1, label: "Home", icon: Home01Icon, href: "/" },
    { id: 2, label: "Calendar", icon: Calendar01Icon, href: "/calendar" },
  ],
  semester: [
    { id: 1, label: "Students", icon: Home01Icon, href: "/students" },
    { id: 2, label: "Subjects", icon: Calendar01Icon, href: "/subjects" },
  ],
  semesterFormats: [
    { id: 1, label: "INS Format 02", icon: GridIcon, href: "#" },
    { id: 2, label: "INS Format 04", icon: GridIcon, href: "#" },
  ],
  programFormats: [
    { id: 1, label: "INS Format 04", icon: GridIcon, href: "#" },
    { id: 2, label: "INS Format 05", icon: GridIcon, href: "#" },
  ],
};

export function StaffSidebar() {
  const { programId } = useParams<{ programId: string }>();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" className="peer flex-1 flex">
      <SidebarHeader className="flex-row items-center">
        <span className="text-lg text-primary px-1.5 font-bold font-brand">
          FORMEX
        </span>
        <Badge variant={"outline"} className="font-mono text-xs">
          STAFF
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER</SidebarGroupLabel>
          <SidebarMenu>
            {items.semester.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={`/p/${programId}${item.href}`}>
                  <SidebarMenuButton
                    isActive={pathname === `/p/${programId}${item.href}`}
                  >
                    <HugeiconsIcon icon={item.icon} /> {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>SEMESTER FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {items.semesterFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={GridIcon} /> {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PROGRAM FORMATS</SidebarGroupLabel>
          <SidebarMenu>
            {items.programFormats.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton>
                  <HugeiconsIcon icon={GridIcon} /> {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <AppSidebarFooter />
    </Sidebar>
  );
}
