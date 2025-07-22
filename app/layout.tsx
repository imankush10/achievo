import "./globals.css";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Achievo - Time to achieve it",
  description: "Track your progress through YouTube playlists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scrollbar-thin">
      <body
        className={`${inter.className} bg-neutral-900 min-h-screen transition-all duration-300`}
      >
        <ToastProvider>
          <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800/40 to-neutral-900 pointer-events-none" />
          <div className="relative z-10">
            <Header />
            <div className="container px-4 py-8 max-w-6xl mx-auto bg-transparent">
              {children}
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
