import { redirect } from "next/navigation";
import type React from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppSidebarProvider } from "@/components/sidebar/app-sidebar-provider";
import { AppSidebarRail } from "@/components/sidebar/app-sidebar-rail";
import { getServerSessionUser } from "../../auth/session";
import { SidebarInset } from "../../components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.institutions.length === 0) {
    redirect("/institutions/new");
  }

  return (
    <AppSidebarProvider>
      <AppSidebar>
        <AppSidebarRail />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </AppSidebarProvider>
  );
}
