"use client";

import React, { useState, useCallback } from "react";
import Sidebar from "@/components/shell/Sidebar";
import Topbar from "@/components/shell/Topbar";

export default function PlatformLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const openMobile  = useCallback(() => setMobileOpen(true),  []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "var(--color-background)",
            }}
        >
            {/* Sidebar — manages its own width transition */}
            <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobile} />

            {/* Main column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Topbar onMobileMenuOpen={openMobile} />

                {/* Page content */}
                <main
                    style={{
                        flex: 1,
                        padding: 24,
                        overflowY: "auto",
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
