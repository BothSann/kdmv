import { AdminSidebar } from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]} redirectTo="/unauthorized">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <main className="flex-1 text-base">
            <header className="flex justify-between items-center py-4 px-8 border-b border-zinc-200 dark:border-zinc-800">
              <SidebarTrigger />

              <div className="flex items-center gap-4">
                <div>Admin Avatar</div>
                <span>Admin Name</span>
              </div>
            </header>

            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
