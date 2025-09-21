import Navigation from "@/components/Navigation";
import Logo from "@/components/Logo";
import HeroCarousel from "@/components/HeroCarousel";

export default function HeaderWithCarousel() {
  return (
    <header className="relative">
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto invert dark:invert-0">
        <Logo width="w-28" />
        <Navigation modeToggleClassName="bg-transparent hover:bg-input/50 border-none" />
      </nav>

      <HeroCarousel />
    </header>
  );
}
