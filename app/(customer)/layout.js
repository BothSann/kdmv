import Header from "@/components/Header";
export default function CustomerLayout({ children }) {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto w-full px-8 py-12">{children}</div>
    </>
  );
}
