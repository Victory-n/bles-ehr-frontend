"use client";

export default function TopbarComponent() {
    return (
        <header className="topbar">
            <div className="topbar-search">
                <span className="search-ico">🔍</span>
                <input type="text" placeholder="Search patients, sessions, staff…" />
            </div>

            <div className="topbar-right">
                <div className="topbar-notif">
                    🔔
                    <span className="notif-badge">3</span>
                </div>

                <div className="topbar-user">
                    <div className="topbar-av">AK</div>
                    <div>
                        <div className="topbar-user-name">Dr. A. Kolade</div>
                        <div className="topbar-user-role">Admin</div>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 4 }}>▾</span>
                </div>
            </div>
        </header>
    );
}