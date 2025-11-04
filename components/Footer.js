import Link from "next/link";
import Logo from "./Logo";

import {
  FaFacebookF,
  FaInstagram,
  FaTelegram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FOOTER_SECTIONS = {
  support: [
    { href: "/returns", label: "Returns & Refunds" },
    { href: "/faq", label: "FAQ & Guides" },
  ],
  policies: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export const SOCIAL_LINKS = [
  {
    Icon: FaFacebookF,
    href: "https://facebook.com/bothsann",
    label: "Facebook",
  },
  {
    Icon: FaInstagram,
    href: "https://instagram.com/bothsann",
    label: "Instagram",
  },
  { Icon: FaYoutube, href: "https://youtube.com/@bothsann", label: "YouTube" },
  { Icon: FaTiktok, href: "https://tiktok.com/@bothsann", label: "TikTok" },
  { Icon: FaTelegram, href: "https://t.me/", label: "Telegram" },
];

export function FooterLinks({ section }) {
  return (
    <ul className="flex flex-col items-start space-y-2">
      {FOOTER_SECTIONS[section].map((link) => (
        <li key={link.label}>
          <Link
            href={link.href}
            className="font-jost text-muted/90 dark:text-accent-foreground/85 hover:underline"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FooterSocialIcons() {
  return (
    <ul className="flex items-center space-x-4 self-start justify-end lg:justify-start">
      {SOCIAL_LINKS.map(({ Icon, href, label }) => (
        <li key={label}>
          <Link href={href} aria-label={label}>
            <Icon size={24} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FooterCopyright() {
  return (
    <div className="pt-16 lg:pt-20">
      <p className="text-center text-sm text-muted/90 dark:text-accent-foreground/85 font-jost tracking-wide">
        &copy; {new Date().getFullYear()} KDMV &amp; Both Sann. All rights
        reserved.
      </p>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-foreground text-background dark:bg-primary-foreground dark:text-foreground pt-8 lg:pt-14 lg:pb-24 pb-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* ============================================
            MOBILE LAYOUT (< md) - Accordion
            ============================================ */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            {/* Logo Section */}
            <AccordionItem value="logo">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                <Logo width="w-30" className="invert object-center" />
              </AccordionTrigger>
              <AccordionContent>
                <Link
                  href="/"
                  className="font-jost tracking-wide text-muted/90 dark:text-accent-foreground/85 hover:underline"
                >
                  Powered by Both Sann
                </Link>
              </AccordionContent>
            </AccordionItem>

            {/* Support Section */}
            <AccordionItem value="support">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                Support
              </AccordionTrigger>
              <AccordionContent>
                <FooterLinks section="support" />
              </AccordionContent>
            </AccordionItem>

            {/* Policies Section */}
            <AccordionItem value="policies">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                Policies
              </AccordionTrigger>
              <AccordionContent>
                <FooterLinks section="policies" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Social Icons (always visible on mobile) */}
          <div className="py-4">
            <FooterSocialIcons />
          </div>
        </div>

        {/* ============================================
            DESKTOP LAYOUT (md+) - Grid
            ============================================ */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 items-center">
          {/* Logo Column */}
          <div className="flex flex-col items-start">
            <Logo width="lg:w-32 w-30" className="invert object-top" />
            <Link
              href="/"
              className="font-jost tracking-wide font-medium text-muted/90 dark:text-accent-foreground/85 hover:underline"
            >
              Powered by Both Sann
            </Link>
          </div>

          {/* Support Column */}
          <div className="flex flex-col items-start space-y-4">
            <p className="uppercase tracking-[0.15em] text-2xl font-bold">
              Support
            </p>
            <FooterLinks section="support" />
          </div>

          {/* Policies Column */}
          <div className="flex flex-col items-start space-y-4">
            <p className="uppercase tracking-[0.15em] text-2xl font-bold">
              Policies
            </p>
            <FooterLinks section="policies" />
          </div>

          {/* Social Icons Column */}
          <div className="flex items-center w-full self-start">
            <FooterSocialIcons />
          </div>
        </div>

        {/* ============================================
            BOTH - Copyright
            ============================================ */}
        <FooterCopyright />
      </div>
    </footer>
  );
}
