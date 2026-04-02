import { redirect } from "next/navigation";
import type React from "react";
import { getServerSessionUser } from "../../auth/session";
import { SidebarInset } from "../../components/ui/sidebar";
import { AppSidebarRail } from "@/components/sidebar/app-sidebar-rail";
import { AppSidebarProvider } from "@/components/sidebar/app-sidebar-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/sign-in");
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
