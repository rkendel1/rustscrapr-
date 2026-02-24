import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rust Web Scraper",
  description: "AI-powered web scraping with design token extraction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
