import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";

export default function Header() {
  return (
    <header className="px-8 sm:px-10 md:px-12 py-5 border-b border-border">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo width="w-20 lg:w-24" />
        <Navigation />
      </nav>
    </header>
  );
}
