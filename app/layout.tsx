import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Tim Lefkowitz",
  description: "Programmer, Retro Game Collector, Synth Maker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-main-bg text-main-text font-sans">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-grow md:ml-64 p-6 md:p-12 pt-24 md:pt-12 max-w-4xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
