import AdminHeader from "@/components/AdminHeader";
import ProtectedRoute from "@/components/ProtectedRoute";

import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import PageOverlay from "@/components/PageOverlay";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["admin"]} redirectTo="/unauthorized">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AdminSidebar />

          <main className="flex-1">
            <AdminHeader />

            <div className="p-6">
              {children}
              <PageOverlay />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
