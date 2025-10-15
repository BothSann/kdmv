import { UserSidebar } from "@/components/UserSidebar";

export default function AccountLayout({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-8 h-[calc(100vh-12rem)] ">
      <UserSidebar />

      {/* Scrollable content area with custom scrollbar */}
      <main className="scrollbar-hide w-full mx-auto md:mx-0 py-8 lg:overflow-y-auto lg:overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
