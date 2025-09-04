import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
export default function SiteLayout({ children }) {
  return (
    <main className="max-w-7xl min-h-screen mx-auto p-6 text-zinc-950 dark:text-zinc-50">
      <Navigation />
      {children}
    </main>
  );
}
