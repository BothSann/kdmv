import { robotoCondensed, poppins } from "@/lib/fonts";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata = {
  title: "Zando Cambodia",
  description: "Zando Cambodia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoCondensed.className} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
