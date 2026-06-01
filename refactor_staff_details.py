import re

filepath = "app/(platform)/staff/[staffId]/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    'import { useState } from "react";',
    'import { useState, useEffect } from "react";'
)

# 2. Remove const staffDetail mock and add state inside the component
mock_staff_old = """const staffDetail = {
    id: "STF-001",
    firstName: "Chisom",
    lastName: "Obi",
    fullName: "Dr. Chisom Obi",
    position: "Psychologist",
    email: "c.obi@brightlife.health",
    phone: "0803 111 2244",
    status: "active",
    roles: ["Therapist", "Session Lead"],
    assignedPatients: 12,
    sessionsMonth: 48,
    sessionsTotal: 214,
    rating: 4.9,
    initials: "CO",
    color: "#2C7A6E",
    joinedDate: "12 Jan 2024",
    lastSeen: "Today, 09:14 AM",
    specialisation: "Trauma & PTSD, Cognitive Behavioural Therapy",
    bio: "Dr. Chisom Obi is a licensed psychologist with over 8 years of experience in trauma-focused therapy and CBT. She holds a PhD in Clinical Psychology from the University of Lagos.",
};"""

content = content.replace(mock_staff_old, "")

component_start = "export default function StaffDetailPage({ params }: { params: { staffId: string } }) {"
component_new_state = """export default function StaffDetailPage({ params }: { params: { staffId: string } }) {
    const [activeTab, setActiveTab] = useState("Overview");
    const [staffDetail, setStaffDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch(`http://localhost:5000/staff/${params.staffId}`, { credentials: "include" });
                const result = await res.json();
                if (res.ok && result.data) {
                    const s = result.data;
                    setStaffDetail({
                        id: s.id,
                        firstName: s.firstName,
                        lastName: s.lastName,
                        fullName: `${s.firstName} ${s.lastName}`,
                        position: s.metadata?.position || "Staff",
                        email: s.email,
                        phone: s.metadata?.phone || "—",
                        status: s.isActive ? "active" : "suspended",
                        roles: [s.role],
                        assignedPatients: s.metadata?.assignedPatients || 0,
                        sessionsMonth: s.metadata?.sessionsMonth || 0,
                        sessionsTotal: s.metadata?.sessionsTotal || 0,
                        rating: s.metadata?.rating || 0.0,
                        initials: s.metadata?.initials || `${s.firstName[0] || ""}${s.lastName[0] || ""}`.toUpperCase(),
                        color: s.metadata?.color || "#2C7A6E",
                        joinedDate: new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                        lastSeen: s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString("en-GB") : "Never",
                        specialisation: s.metadata?.specialisation || "General",
                        bio: s.metadata?.bio || "No biography provided.",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch staff details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaff();
    }, [params.staffId]);

    if (isLoading) {
        return <div style={{ padding: 40, textAlign: "center" }}>Loading staff member details...</div>;
    }

    if (!staffDetail) {
        return <div style={{ padding: 40, textAlign: "center" }}>Staff member not found.</div>;
    }"""

# Replace the component start and its own activeTab state
content = content.replace(
    component_start + '\n    const [activeTab, setActiveTab] = useState("Overview");',
    component_new_state
)

# Fix role mapping implicit any issue proactively
content = content.replace(
    "staffDetail.roles.map(r =>",
    "staffDetail.roles.map((r: any) =>"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Done details")
