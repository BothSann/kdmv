import Header from "@/components/Header";

export default function CustomerLayout({ children }) {
  return (
    <div className="h-screen font-poppins">
      <Header />
      <main className="max-w-7xl mx-auto w-full pt-12 px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
