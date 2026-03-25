import { AppSidebar } from "@/components/sidebar/app";
import { ProgramSidebar } from "@/components/sidebar/program";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `calc(16rem*2)`,
        } as React.CSSProperties
      }
    >
      <AppSidebar className="border-r">
        <ProgramSidebar />
      </AppSidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
