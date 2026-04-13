import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Clarum — Clinical Management Platform",
  description: "Clinical management platform for mental health centres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}