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

export default function Footer() {
  return (
    <footer className="bg-foreground text-background dark:bg-primary-foreground dark:text-foreground pt-8 lg:pb-28 lg:pt-16 pb-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* MOBILE: Accordion (hidden on lg+) */}
        <div className="lg:hidden">
          <Accordion type="single" collapsible>
            {/* Logo section */}
            <AccordionItem value="logo">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                <Logo width="lg:w-32 w-30" className="invert object-center" />
              </AccordionTrigger>
              <AccordionContent>
                <Link
                  href="/"
                  className="font-jost tracking-wide text-muted/90 text-base dark:text-accent-foreground/85 hover:underline"
                >
                  Powered by Both Sann
                </Link>
              </AccordionContent>
            </AccordionItem>

            {/* Support section */}
            <AccordionItem value="support">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                Support
              </AccordionTrigger>
              <AccordionContent>
                {/* Use shared FooterLinks component */}
                <FooterLinks section="support" />
              </AccordionContent>
            </AccordionItem>

            {/* Policies section */}
            <AccordionItem value="policies">
              <AccordionTrigger className="uppercase tracking-[0.15em] text-2xl font-bold">
                Policies
              </AccordionTrigger>
              <AccordionContent>
                <FooterLinks section="policies" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* DESKTOP: Grid (hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-10 items-center">
          {/* Logo column */}
          <div className="flex flex-col items-start">
            <Logo width="lg:w-32 w-30" className="invert object-top" />
            <Link
              href="/"
              className="font-jost tracking-wide text-muted/90 text-base dark:text-accent-foreground/85 hover:underline"
            >
              Powered by Both Sann
            </Link>
          </div>

          {/* Support column */}
          <div className="flex flex-col items-start space-y-4">
            <h3 className="uppercase tracking-[0.15em] text-2xl font-bold">
              Support
            </h3>
            <FooterLinks section="support" />
          </div>

          {/* Policies column */}
          <div className="flex flex-col items-start space-y-4">
            <h3 className="uppercase tracking-[0.15em] text-2xl font-bold">
              Policies
            </h3>
            <FooterLinks section="policies" />
          </div>

          {/* Social icons column */}
          <FooterSocialIcons />
        </div>

        {/* BOTH: Social icons (mobile - always visible) */}
        <div className="lg:hidden py-4">
          <FooterSocialIcons />
        </div>

        {/* BOTH: Copyright (always visible) */}
        <FooterCopyright />
      </div>
    </footer>
  );
}

// Shared Sub-Components (DRY):

// Define links ONCE
const FOOTER_LINKS = {
  support: [
    { href: "/", label: "Returns & Refunds" },
    { href: "/", label: "FAQ & Guides" },
  ],

  policies: [
    { href: "/", label: "Terms of Service" },
    { href: "/", label: "Privacy Policy" },
  ],
};

// Reusable component for links
function FooterLinks({ section }) {
  return (
    <ul className="flex flex-col items-start space-y-2 font-jost tracking-wide text-muted/90 dark:text-accent-foreground/85 *:hover:underline text-base">
      {FOOTER_LINKS[section].map((link) => (
        <li key={link.label}>
          <Link href={link.href}>{link.label}</Link>
        </li>
      ))}
    </ul>
  );
}

// Reusable social icons
function FooterSocialIcons() {
  const icons = [
    { Icon: FaFacebookF, href: "/" },
    { Icon: FaInstagram, href: "/" },
    { Icon: FaYoutube, href: "/" },
    { Icon: FaTiktok, href: "/" },
    { Icon: FaTelegram, href: "/" },
  ];

  return (
    <ul className="flex items-center space-x-4 self-start">
      {icons.map(({ Icon, href }, idx) => (
        <li key={idx}>
          <Link href={href}>
            <Icon size={26} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Reusable copyright
function FooterCopyright() {
  return (
    <div className=" pt-16 lg:pt-20">
      <p className="text-center text-sm text-muted/90 dark:text-accent-foreground/85 font-jost tracking-wide">
        &copy; {new Date().getFullYear()} KDMV &amp; Both Sann. All rights
        reserved.
      </p>
    </div>
  );
}
