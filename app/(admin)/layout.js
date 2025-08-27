import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { poppins } from "@/lib/fonts";

export default function AdminLayout({ children }) {
  return (
    <div className={`${poppins.className} p-6`}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
