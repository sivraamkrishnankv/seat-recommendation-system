// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scenic Seat Finder",
  description: "Interactive 3D Globe with city and sun visualization",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white h-screen w-screen overflow-hidden">
        {/* Flex container ensures center placement */}
        <main className="flex items-center justify-center h-full w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
