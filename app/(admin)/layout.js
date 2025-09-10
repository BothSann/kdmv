import AdminHeader from "@/components/AdminHeader";
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
          <main className="flex-1">
            <AdminHeader />

            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
