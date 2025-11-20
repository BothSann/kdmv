import AdminHeader from "@/components/admin/AdminHeader";
import ProtectedRoute from "@/components/ProtectedRoute";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import PageOverlay from "@/components/PageOverlay";
import { getCurrentUser, getUserRole } from "@/lib/api/users";
import { redirect } from "next/navigation";

// Force dynamic rendering for all admin routes (they use authentication cookies)
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { role } = await getUserRole(user.id);

  if (role !== "admin") {
    redirect("/unauthorized");
  }

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
