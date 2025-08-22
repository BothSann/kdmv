import { robotoCondensed } from "@/lib/fonts";
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
        className={`${robotoCondensed.className} antialiased bg-white dark:bg-black`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-7xl min-h-screen mx-auto p-6">
            <Navigation />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
