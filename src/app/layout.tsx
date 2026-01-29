import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/SideBar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CDCG Dashboard",
  description: "Internal Project Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />

            <main className="w-full flex flex-col min-h-screen">
              {/* Header: Added a slightly darker border for #121212 compatibility */}
              <header className="flex h-12 items-center px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 dark:border-zinc-800">
                <SidebarTrigger />
                <div className="ml-4 font-semibold text-sm tracking-tight">
                  {`Captain Dick's Dashboard`}
                </div>
              </header>

              {/* CONTENT AREA: 
                - bg-background handles light mode (white)
                - dark:bg-[#121212] forces your specific hex code in dark mode
              */}
              <div className="flex-1 overflow-auto bg-background dark:bg-[#121212] transition-colors duration-300">
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
