import { UserSidebar } from "@/components/UserSidebar";

export default function AccountLayout({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-8 h-[calc(100vh-12rem)] ">
      <UserSidebar />

      {/* Scrollable content area with custom scrollbar */}
      <main className="overflow-y-auto overflow-x-hidden scrollbar-hide w-full mx-auto md:mx-0">
        {children}
      </main>
    </div>
  );
}
