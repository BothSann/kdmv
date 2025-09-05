import Header from "@/components/Header";
export default function CustomerLayout({ children }) {
  return (
    <div className="h-screen">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-8 py-12">{children}</main>
    </div>
  );
}
