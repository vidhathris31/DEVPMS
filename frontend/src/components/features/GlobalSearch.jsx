import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { STATUS_CFG, TYPE_ICON } from "../../utils/constants";
import { Tag, Av } from "../ui/Primitives";

export default function GlobalSearch({ projects, employees, onSelect, onClose }) {
  const T = useTheme();
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const query = q.toLowerCase();
  const pr = q ? projects.filter((p) => p.name.toLowerCase().includes(query) || p.stack?.join(" ").toLowerCase().includes(query) || p.type.toLowerCase().includes(query)) : [];
  const er = q ? employees.filter((e) => e.name.toLowerCase().includes(query) || e.role.toLowerCase().includes(query) || e.dept.toLowerCase().includes(query)) : [];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 16px" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: `linear-gradient(145deg,${T.card},${T.bg2})`, border: `1px solid ${T.blue}50`, borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: `0 0 0 1px ${T.blue}15,0 40px 100px rgba(0,0,0,0.8)`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
          <span style={{ color: T.cyan, fontFamily: T.mono, fontSize: 14 }}>⌕</span>
          <input
            ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="search projects, engineers, stack…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: T.cyan, background: "transparent", fontFamily: T.mono }}
          />
          <kbd style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 5, padding: "2px 7px", color: T.t3, fontFamily: T.mono }}>esc</kbd>
        </div>
        {pr.length > 0 || er.length > 0 ? (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {pr.length > 0 && (
              <>
                <div style={{ padding: "7px 16px", fontSize: 9, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.6, background: "rgba(0,0,0,0.3)", fontFamily: T.mono }}>PROJECTS</div>
                {pr.map((p) => (
                  <div
                    key={p._id || p.id}
                    onClick={() => {
                      onSelect("project", p);
                      onClose();
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", borderBottom: `1px solid ${T.cardBorder}`, transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.blueGlow)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 16, color: T.cyan }}>{TYPE_ICON[p.type]}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#F0F6FF" }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono }}>
                        {p.progress}% · {p.stack.slice(0, 2).join(", ")}
                      </p>
                    </div>
                    <Tag label={STATUS_CFG[p.status]?.label} color={STATUS_CFG[p.status]?.color} bg={STATUS_CFG[p.status]?.glow} />
                  </div>
                ))}
              </>
            )}
            {er.length > 0 && (
              <>
                <div style={{ padding: "7px 16px", fontSize: 9, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.6, background: "rgba(0,0,0,0.3)", fontFamily: T.mono }}>ENGINEERS</div>
                {er.map((e, i) => (
                  <div
                    key={e._id || e.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}` }}
                  >
                    <Av initials={e.avatar} size={30} idx={i} />
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#F0F6FF" }}>{e.name}</p>
                      <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono }}>
                        {e.role} · {e.dept} · {e.workload}% load
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          q && <p style={{ padding: "28px", textAlign: "center", color: T.t3, fontSize: 12, fontFamily: T.mono }}>no results for &quot;{q}&quot;</p>
        )}
        {!q && (
          <div style={{ padding: "14px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Backend", "Security", "Fintech", "active"].map((hint) => (
              <button
                key={hint} onClick={() => setQ(hint)}
                style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${T.cardBorder}`, background: "rgba(255,255,255,0.06)", color: T.t3, fontSize: 11, cursor: "pointer", fontFamily: T.mono }}
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
