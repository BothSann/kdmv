import Navigation from "@/components/Navigation";
import Logo from "@/components/Logo";

export default function Header() {
  return (
    <header className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <Logo />
        <Navigation />
      </nav>
    </header>
  );
}
