import { Navigation } from "@/components/navigation";
import { QueryProvider } from "@/components/providers/query-provider";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Orca Whirlpool Dashboard",
  description: "View and manage your Orca Whirlpool liquidity positions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <SolanaWalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navigation />
              <div className="flex-1">{children}</div>
            </div>
          </SolanaWalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
