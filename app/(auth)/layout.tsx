import type { Metadata } from "next";
import "../globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "BrightLife EHR — Secure Provider Portal",
    description: "BrightLife Electronic Health Records — secure clinical platform for Nigerian healthcare.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full antialiased">
        <head>
            {/* Google Fonts — Google Sans body font + JetBrains Mono + Material Symbols */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                rel="stylesheet"
            />
        </head>
        <body className="min-h-full flex flex-col">
        {children}
        </body>
        </html>
    );
}
