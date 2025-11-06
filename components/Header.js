import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";

export default function Header() {
  return (
    <header className="px-8 py-5 border-b border-border">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo width="w-20 md:w-24 lg:w-28" />
        <Navigation />
      </nav>
    </header>
  );
}
