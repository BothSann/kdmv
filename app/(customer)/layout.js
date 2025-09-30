import Header from "@/components/Header";

export default function CustomerLayout({ children }) {
  return (
    <div className="h-screen font-jost">
      <Header />
      <main className="max-w-7xl mx-auto w-full px-8 pt-16">{children}</main>
    </div>
  );
}
