import ConditionalFooter from "@/components/ConditionalFooter";
import Header from "@/components/Header";

// Force dynamic rendering for customer routes (account pages and checkout use authentication)
export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }) {
  return (
    <div className="font-poppins">
      <Header />
      <main className="max-w-7xl mx-auto w-full py-12 lg:py-14 px-6 lg:px-8">
        {children}
      </main>
      <ConditionalFooter />
    </div>
  );
}
