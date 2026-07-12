import { useState } from "react";
import { useTheme, useThemeMode } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { Card, Tag, Av, Btn } from "../components/ui/Primitives";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function SettingsPage() {
  const T = useTheme();
  const { mode } = useThemeMode();
  const { user, logout } = useAuth();
  const { employees } = useData();
  const [tab, setTab] = useState("account");

  // Real role breakdown, derived from the employee roster in MongoDB — not fabricated data.
  const roleCounts = employees.reduce((acc, e) => {
    acc[e.role] = (acc[e.role] || 0) + 1;
    return acc;
  }, {});
  const roleEntries = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
  const roleColors = [T.blue, T.cyan, T.green, T.violet, T.amber, T.red, T.pink];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Av initials={user?.name?.slice(0, 2).toUpperCase() || "U"} size={52} idx={0} ring />
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.t1 }}>{user?.name}</p>
            <p style={{ margin: "2px 0", fontSize: 12, color: T.t3, fontFamily: T.mono }}>{user?.email}</p>
            <Tag label={user?.role} color={T.blue} bg={T.blueGlow} small />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ThemeToggle />
            <Btn variant="danger" onClick={logout}>
              Log out
            </Btn>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 2, borderBottom: `1.5px solid ${T.cardBorder}`, marginBottom: 4 }}>
        {["account", "team", "policy"].map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t ? T.blue : "transparent"}`, color: tab === t ? T.blue : T.t3, fontWeight: tab === t ? 700 : 500, fontSize: 12, padding: "8px 16px", cursor: "pointer", marginBottom: -1, textTransform: "capitalize", fontFamily: T.mono, transition: "all 0.12s" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Authentication</p>
            {[["Method", "Email + Password (JWT)"], ["Token lifetime", "7 days"], ["Password hashing", "bcrypt"], ["Account role", user?.role]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 13, color: T.t2, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 12, color: T.t3, fontFamily: T.mono, textTransform: k === "Account role" ? "capitalize" : "none" }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Appearance</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
              <span style={{ fontSize: 13, color: T.t2, fontWeight: 600 }}>Theme</span>
              <ThemeToggle compact />
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>Currently in {mode} mode. This also toggles from the header on every page.</p>
          </Card>
        </div>
      )}

      {tab === "team" && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Team by Role</p>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: T.t3, fontFamily: T.mono }}>Computed from the {employees.length} engineers on the roster.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {roleEntries.map(([role, count], i) => (
              <div key={role} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: roleColors[i % roleColors.length] }}>{role}</span>
                  <Tag label={`${count}`} color={roleColors[i % roleColors.length]} bg={roleColors[i % roleColors.length] + "20"} small />
                </div>
              </div>
            ))}
            {roleEntries.length === 0 && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>No employees on the roster yet.</p>}
          </div>
        </Card>
      )}

      {tab === "policy" && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Security Policy</p>
          {[["JWT Expiry", "7 days"], ["Password Min Length", "8 chars"], ["Rate limit (AI)", "20 req/min"], ["Rate limit (API)", "500 req/15min"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
              <span style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.t2, fontFamily: T.mono }}>{v}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
