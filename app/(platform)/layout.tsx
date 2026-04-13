import type { Metadata } from "next";
import "@/app/globals.css";
import SidebarComponent from "@/app/components/sidebar";
import TopbarComponent from "@/app/components/topbar";
import React from "react";

export const metadata: Metadata = {
    title: "Clarum — Clinical Management Platform",
    description: "Clinical management platform for mental health centres",
};

export default function PlatformLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <>
            <SidebarComponent />
            <TopbarComponent />
            <div className="main-wrap">{children}</div>
        </>
    );
}