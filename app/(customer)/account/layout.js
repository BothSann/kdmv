import { UserSidebar } from "@/components/UserSidebar";

export default function AccountLayout({ children }) {
  return (
    <div className="grid grid-cols-[16rem_1fr] gap-12 min-h-[calc(100vh-12rem)]">
      <UserSidebar />
      <div>{children}</div>
    </div>
  );
}
