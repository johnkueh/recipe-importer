import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe importer",
  description: "Use LLM to import recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
