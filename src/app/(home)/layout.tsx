import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { PrincipalSidebar } from "@/components/sidebar/principal-sidebar";
import { ProgramHeadSidebar } from "@/components/sidebar/program-head-sidebar";
import { StaffSidebar } from "@/components/sidebar/staff-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar>
        {session.user.role === "staff" && <StaffSidebar />}
        {session.user.role === "program_head" && <ProgramHeadSidebar />}
        {session.user.role === "principal" && <PrincipalSidebar />}
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
