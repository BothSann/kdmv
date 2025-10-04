import { robotoCondensed, inconsolata, poppins, jost } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "react-photo-view/dist/react-photo-view.css";

import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "KDMV Cambodia",
  description: "KDMV Cambodia",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} ${poppins.variable} ${jost.variable} bg-background text-foreground/90 dark:text-foreground/90 dark:bg-background antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" expand visibleToasts={2} />

          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
