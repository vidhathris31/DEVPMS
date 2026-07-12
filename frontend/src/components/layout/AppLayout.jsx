import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useData } from "../../context/DataContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import GlobalSearch from "../features/GlobalSearch";
import Notifs from "../features/Notifs";

export default function AppLayout() {
  const T = useTheme();
  const navigate = useNavigate();
  const { projects, employees } = useData();
  const [collapsed, setCollapsed] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: T.sans, color: T.t1 }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, left: collapsed ? 60 : 220, width: 600, height: 600, borderRadius: "50%", background: T.blue, filter: "blur(120px)", opacity: 0.025 }} />
        <div style={{ position: "absolute", bottom: -200, right: 0, width: 500, height: 500, borderRadius: "50%", background: T.violet, filter: "blur(120px)", opacity: 0.02 }} />
        <div style={{ position: "absolute", top: "40%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: T.cyan, filter: "blur(100px)", opacity: 0.015 }} />
      </div>

      {showSearch && (
        <GlobalSearch
          projects={projects} employees={employees}
          onSelect={(type, item) => {
            if (type === "project") navigate(`/projects/${item._id}`);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
      {showNotif && <Notifs projects={projects} onClose={() => setShowNotif(false)} />}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Header onOpenSearch={() => setShowSearch(true)} onToggleNotif={() => setShowNotif((n) => !n)} notifOpen={showNotif} />
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: T.mainBg }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
