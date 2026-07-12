import { NavLink } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { NAV } from "../../utils/constants";
import { Av, Tag } from "../ui/Primitives";

export default function Sidebar({ collapsed, onToggle }) {
  const T = useTheme();
  const { user } = useAuth();

  return (
    <aside
      style={{
        position: "relative", zIndex: 10, width: collapsed ? 62 : 222, flexShrink: 0, background: T.sidebarBg,
        borderRight: `2px solid ${T.cardBorder}`, display: "flex", flexDirection: "column",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1)", overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,${T.blue},${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0, boxShadow: `0 0 16px ${T.blue}40` }}>◈</div>
        {!collapsed && (
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.t1, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: T.mono, lineHeight: 1 }}>DevPMS</p>
            <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono }}>IT Project Suite</p>
          </div>
        )}
      </div>

      <nav style={{ overflowY: "auto", padding: "8px", flex: 1 }}>
        {NAV.map((item) => (
          <NavLink
            key={item.id} to={item.path} end={item.path === "/dashboard"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 9,
              border: "none", cursor: "pointer", textDecoration: "none",
              background: isActive ? `linear-gradient(135deg,${T.blue}25,${T.cyan}10)` : "transparent",
              color: isActive ? T.cyan : T.t2, fontSize: 13, fontWeight: isActive ? 700 : 500, marginBottom: 2,
              transition: "all 0.15s", textAlign: "left", fontFamily: T.mono,
              boxShadow: isActive ? `inset 0 0 0 1px ${T.blue}40` : "none",
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 13, flexShrink: 0, width: 22, textAlign: "center", filter: isActive ? `drop-shadow(0 0 6px ${T.cyan})` : "none" }}>{item.icon}</span>
                {!collapsed && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.cardBorder}`, flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 6 }}>
            <Av initials={user?.name?.slice(0, 2).toUpperCase() || "U"} size={28} idx={0} ring />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.t2, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{user?.name}</p>
              <div style={{ marginTop: 2 }}>
                <Tag label={user?.role} color={T.blue} bg={T.blueGlow} small />
              </div>
            </div>
            <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 6px ${T.green}`, flexShrink: 0 }} />
          </div>
        )}
        <button
          onClick={onToggle}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "7px", borderRadius: 8, border: `1.5px solid ${T.cardBorder}`, background: "transparent", cursor: "pointer", color: T.t3, fontSize: 10, fontFamily: T.mono, transition: "all 0.12s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.blue;
            e.currentTarget.style.color = T.blue;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.cardBorder;
            e.currentTarget.style.color = T.t3;
          }}
        >
          {collapsed ? "▶" : "◀ collapse"}
        </button>
      </div>
    </aside>
  );
}
