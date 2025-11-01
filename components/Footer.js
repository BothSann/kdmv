import Link from "next/link";
import Logo from "./Logo";
import { Facebook } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaSnapchat,
  FaTelegram,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background dark:bg-primary-foreground dark:text-foreground pt-16 lg:pb-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-0 items-center">
          <div className="flex flex-col items-start">
            <Logo width="lg:w-32 w-30" className="invert object-top" />
            <Link
              href="/"
              className="font-jost tracking-wide font-medium text-muted/90 dark:text-accent-foreground/85"
            >
              Powered by Both Sann
            </Link>
          </div>
          <div className="flex flex-col items-start space-y-4">
            <p className="uppercase tracking-[0.15em] text-2xl font-bold">
              Support
            </p>

            <ul className="flex flex-col items-start font-jost tracking-wide font-medium text-muted/90 dark:text-accent-foreground/85 space-y-2">
              <Link href="/">Returns &amp; Refunds</Link>
              <Link href="/">FAQ &amp; Guides</Link>
            </ul>
          </div>

          <div className="flex flex-col items-start space-y-4">
            <p className="uppercase tracking-[0.15em] text-2xl font-bold">
              Policies
            </p>

            <ul className="flex flex-col items-start font-jost tracking-wide font-medium text-muted/90 dark:text-accent-foreground/85 space-y-2">
              <Link href="/">Terms of Service</Link>
              <Link href="/">Privacy Policy</Link>
            </ul>
          </div>

          <div className="flex items-center w-full">
            <ul className="flex items-center space-x-6">
              <Link href="/">
                <FaFacebookF size={26} />
              </Link>
              <Link href="/">
                <FaInstagram size={26} />
              </Link>
              <Link href="/">
                <FaYoutube size={26} />
              </Link>
              <Link href="/">
                <FaTiktok size={26} />
              </Link>
              <Link href="/">
                <FaTelegram size={26} />
              </Link>
            </ul>
          </div>
        </div>

        <div className="pt-20">
          <p className="text-center text-sm text-muted/90 dark:text-accent-foreground/85 font-jost tracking-wide">
            &copy; {new Date().getFullYear()} KDMV &amp; Both Sann. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
