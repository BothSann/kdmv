import ConditionalFooter from "@/components/ConditionalFooter";
import Header from "@/components/Header";

export default function CustomerLayout({ children }) {
  return (
    <div className="font-poppins">
      <Header />
      <main className="max-w-7xl mx-auto w-full py-12 lg:py-18 px-6 lg:px-8">
        {children}
      </main>
      <ConditionalFooter />
    </div>
  );
}
