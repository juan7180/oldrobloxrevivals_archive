import type { Metadata } from "next";
import { Suspense } from "react";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "r/oldrobloxrevivals Archive",
  description: "Offline archive of r/oldrobloxrevivals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Suspense fallback={<header className="h-12 bg-reddit-card border-b" />}>
          <TopNav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
