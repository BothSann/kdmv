import { robotoCondensed } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import AuthProvider from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./globals.css";

export const metadata = {
  title: "Zando Cambodia",
  description: "Zando Cambodia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoCondensed.className} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors position="top-right" expand={true} />

          <AuthProvider>
            <main className="max-w-7xl mx-auto">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
