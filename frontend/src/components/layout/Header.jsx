import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useData } from "../../context/DataContext";
import { dLeft } from "../../utils/formatters";
import { NAV } from "../../utils/constants";
import { Btn, LiveClock } from "../ui/Primitives";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header({ onOpenSearch, onToggleNotif, notifOpen }) {
  const T = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, unreadNotificationCount } = useData();

  const navItem = NAV.find((n) => location.pathname.startsWith(n.path));
  const isProjectDetail = location.pathname.startsWith("/projects/") && location.pathname !== "/projects";
  const currentProject = isProjectDetail ? projects.find((p) => p._id === location.pathname.split("/")[2]) : null;
  const title = currentProject?.name || navItem?.label || "Dashboard";

  const alertCount =
    projects.filter((p) => p.status === "active" && (dLeft(p.deadline) < 0 || dLeft(p.deadline) <= 30 || p.spent / (p.budget || 1) > 0.85)).length +
    (projects.reduce((a, p) => a + (p.prs?.filter((pr) => pr.status === "open").length || 0), 0) > 0 ? 1 : 0) +
    unreadNotificationCount;

  return (
    <header style={{ height: 52, background: T.headerBg, backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: T.t4, fontFamily: T.mono }}>/</span>
        {navItem && navItem.path !== "/dashboard" && (
          <>
            <span style={{ fontSize: 11, color: T.t2, fontWeight: 600, fontFamily: T.mono }}>{navItem.id}</span>
            <span style={{ fontSize: 11, color: T.t4, fontFamily: T.mono }}>/</span>
          </>
        )}
        <span style={{ fontSize: 12, color: T.cyan, fontFamily: T.mono, fontWeight: 800, letterSpacing: 0.3 }}>{title}</span>
      </div>
      <LiveClock />
      <ThemeToggle />
      <button
        onClick={onOpenSearch}
        style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "6px 12px", background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: 11, color: T.t3, fontFamily: T.mono, transition: "all 0.12s" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = T.blue;
          e.currentTarget.style.color = T.cyan;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = T.cardBorder;
          e.currentTarget.style.color = T.t3;
        }}
      >
        ⌕ search <kbd style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd>
      </button>
      <Btn onClick={() => navigate("/projects?new=1")} icon="+">
        New Project
      </Btn>
      <button
        onClick={onToggleNotif}
        style={{ position: "relative", background: notifOpen ? T.blueGlow : "rgba(255,255,255,0.02)", border: `1px solid ${notifOpen ? T.blue + "50" : T.cardBorder}`, borderRadius: 8, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.t3, fontSize: 14, transition: "all 0.12s" }}
      >
        ◈
        {alertCount > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: T.red, borderRadius: "50%", fontSize: 8, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, boxShadow: `0 0 8px ${T.red}` }}>
            {alertCount}
          </span>
        )}
      </button>
    </header>
  );
}
