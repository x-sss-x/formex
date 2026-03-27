import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { PrincipalSidebar } from "@/components/sidebar/principal-sidebar";
import { ProgramSidebar } from "@/components/sidebar/program-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `calc(16rem*2)`,
        } as React.CSSProperties
      }
    >
      <AppSidebar className="border-r">
        <PrincipalSidebar className="border-r" />
        <ProgramSidebar />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
