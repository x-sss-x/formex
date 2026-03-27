import { redirect } from "next/navigation";
import type React from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { PrincipalSidebar } from "@/components/sidebar/principal-sidebar";
import { ProgramHeadSidebar } from "@/components/sidebar/program-head-sidebar";
import { ProgramSidebar } from "@/components/sidebar/program-sidebar";
import { StaffSidebar } from "@/components/sidebar/staff-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/sign-in");

  return (
    <SidebarProvider>
      <AppSidebar>
        {session?.user.role === "staff" && <StaffSidebar />}
        {session?.user.role === "program_head" && <ProgramHeadSidebar />}
        {session?.user.role === "principal" && <PrincipalSidebar />}
        <ProgramSidebar />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
