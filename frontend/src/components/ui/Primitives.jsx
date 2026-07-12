import { useState, useEffect } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { clamp } from "../../utils/formatters";
import { ac } from "../../utils/constants";

export function Av({ initials, size = 32, idx = 0, ring = false }) {
  const T = useTheme();
  const c = ac(idx);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: c + "1A",
        border: `${ring ? "2px" : "1.5px"} solid ${c}${ring ? "90" : "40"}`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700,
        color: c, flexShrink: 0, fontFamily: T.mono, boxShadow: ring ? `0 0 10px ${c}50` : "none",
      }}
    >
      {initials}
    </div>
  );
}

export function Tag({ label, color, bg, dot = false, small = false }) {
  const T = useTheme();
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: small ? "2px 8px" : "4px 10px", borderRadius: 6, fontSize: small ? 10 : 12, fontWeight: 700,
        letterSpacing: 0.2, color, background: bg || color + "25", border: `1.5px solid ${color}50`, fontFamily: T.mono,
        boxShadow: `0 0 8px ${color}20`,
      }}
    >
      {dot && (
        <span
          style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", boxShadow: `0 0 6px ${color}` }}
        />
      )}
      {label}
    </span>
  );
}

export function StackTag({ label }) {
  const T = useTheme();
  return (
    <span
      style={{
        display: "inline-block", padding: "3px 9px", borderRadius: 5, fontSize: 11,
        fontWeight: 700, color: "#7EE8FA", background: "rgba(52,212,240,0.15)", border: `1.5px solid rgba(52,212,240,0.4)`,
        fontFamily: T.mono, whiteSpace: "nowrap", boxShadow: "0 0 8px rgba(52,212,240,0.15)",
      }}
    >
      {label}
    </span>
  );
}

export function Card({ children, style = {}, onClick, glow = false, glowColor, noPad = false }) {
  const T = useTheme();
  const gc = glowColor || T.blue;
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", background: `linear-gradient(145deg,${T.card},${T.bg2})`,
        border: `1px solid ${hov && onClick ? gc + "60" : T.cardBorder}`, borderRadius: 14,
        padding: noPad ? 0 : "1.2rem 1.3rem", overflow: "hidden",
        transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
        boxShadow: hov && onClick ? `0 0 0 1px ${gc}20,0 8px 32px rgba(0,0,0,0.4),0 0 24px ${gc}08` : "0 1px 3px rgba(0,0,0,0.3)",
        cursor: onClick ? "pointer" : "default", ...style,
      }}
    >
      {glow && (
        <div
          style={{ position: "absolute", top: -60, right: -60, width: 160, height: 160, borderRadius: "50%", background: gc, filter: "blur(80px)", opacity: 0.06, pointerEvents: "none" }}
        />
      )}
      {children}
    </div>
  );
}

export function Modal({ title, sub, onClose, children, wide = false }) {
  const T = useTheme();
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: `linear-gradient(145deg,${T.card},${T.bg2})`, border: `1px solid ${T.blue}40`, borderRadius: 18,
          width: "100%", maxWidth: wide ? 800 : 520, maxHeight: "92vh", overflowY: "auto",
          boxShadow: `0 0 0 1px ${T.blue}15,0 40px 100px rgba(0,0,0,0.7),0 0 40px ${T.blue}08`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${T.cardBorder}` }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.t1, letterSpacing: -0.3 }}>{title}</h3>
            {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>{sub}</p>}
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${T.cardBorder}`, cursor: "pointer", color: T.t3, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, fontSize: 14 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.t1)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.t3)}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", small = false, disabled = false, icon, style = {}, type = "button" }) {
  const T = useTheme();
  const [hov, setHov] = useState(false);
  const vars = {
    primary: { bg: hov ? T.blueD : T.blue, color: "#fff", border: "none", shadow: hov ? `0 0 20px ${T.blue}40` : "none" },
    secondary: { bg: hov ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)", color: T.t2, border: `1.5px solid ${T.cardBorder}`, shadow: "none" },
    ghost: { bg: hov ? T.blueGlow : "transparent", color: T.blue, border: `1px solid ${T.blue}40`, shadow: "none" },
    danger: { bg: hov ? "#DC2626" : T.red, color: "#fff", border: "none", shadow: "none" },
    success: { bg: hov ? "#16A34A" : T.green, color: T.bg, border: "none", shadow: hov ? `0 0 16px ${T.green}40` : "none" },
  };
  const v = vars[variant] || vars.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: v.bg, color: v.color,
        border: v.border, borderRadius: 8, padding: small ? "5px 11px" : "8px 16px",
        fontSize: small ? 11 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, transition: "all 0.15s", boxShadow: v.shadow, fontFamily: T.sans, ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export function Prg({ value, color, h = 4 }) {
  const T = useTheme();
  if (color === undefined) color = T.blue;
  const c = value >= 100 ? T.green : value >= 75 ? T.cyan : color;
  return (
    <div style={{ height: h, background: "rgba(255,255,255,0.12)", borderRadius: h, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div
        style={{
          height: "100%", width: `${clamp(value, 0, 100)}%`,
          background: `linear-gradient(90deg,${c}CC,${c})`, borderRadius: h,
          boxShadow: `0 0 12px ${c}70`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text", rows, onKeyDown, style = {} }) {
  const T = useTheme();
  const common = {
    border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "9px 12px",
    fontSize: 13, color: T.t1, background: T.bg2, outline: "none",
    width: "100%", boxSizing: "border-box", fontFamily: T.sans,
  };
  if (rows) return <textarea value={value} onChange={onChange} rows={rows} onKeyDown={onKeyDown} style={{ ...common, resize: "vertical", ...style }} />;
  return <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown} style={{ ...common, ...style }} />;
}

export function Select({ value, onChange, options, style = {} }) {
  const T = useTheme();
  return (
    <select
      value={value}
      onChange={onChange}
      style={{ border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.t1, background: T.bg2, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: T.sans, ...style }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FL({ label, required, children }) {
  const T = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: T.t3, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>
        {label}
        {required && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function LiveClock() {
  const T = useTheme();
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.t3, letterSpacing: 0.5 }}>
      {t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
    </span>
  );
}

// ─── SVG CHARTS ───────────────────────────────────────────────────────────────

export function Ring({ value, size = 72, color, thickness = 5 }) {
  const T = useTheme();
  if (color === undefined) color = T.blue;
  const r = (size - thickness * 2) / 2,
    circ = 2 * Math.PI * r,
    dash = (value / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}80)`, transition: "stroke-dasharray 0.9s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color: T.t1, fontFamily: T.mono, lineHeight: 1 }}>{value}%</span>
      </div>
    </div>
  );
}

export function SparkArea({ data, color, height = 40, width = 140 }) {
  const T = useTheme();
  if (color === undefined) color = T.blue;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - clamp(v / max, 0, 1) * (height - 4) - 2}`);
  const area = `${pts.join(" ")} ${width},${height} 0,${height}`;
  const gradId = `g${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]}
        r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

export function BarChart({ data, color, height = 80, width = 260 }) {
  const T = useTheme();
  if (color === undefined) color = T.blue;
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.v)) || 1;
  const bw = Math.floor((width - data.length * 4) / data.length);
  return (
    <svg width={width} height={height + 16}>
      {data.map((d, i) => {
        const bh = Math.max(2, (d.v / max) * (height - 8)),
          x = i * (bw + 4),
          y = height - bh - 4;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={3} fill={color} opacity={0.55 + (i / data.length) * 0.45} style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
            <text x={x + bw / 2} y={height + 14} textAnchor="middle" fill={T.t2} fontSize="9" fontFamily={T.mono}>
              {d.m}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VelocityChart({ data, height = 60, width = 200 }) {
  const T = useTheme();
  const max = Math.max(...data, 1);
  const bw = Math.floor((width - data.length * 3) / data.length);
  const labels = ["W-6", "W-5", "W-4", "W-3", "W-2", "W-1", "Now"];
  return (
    <svg width={width} height={height + 16}>
      {data.map((v, i) => {
        const bh = Math.max(2, (v / max) * (height - 6)),
          x = i * (bw + 3),
          y = height - bh - 2,
          isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={2} fill={isLast ? T.cyan : T.blue} opacity={isLast ? 1 : 0.5} style={{ filter: isLast ? `drop-shadow(0 0 6px ${T.cyan})` : "none" }} />
            <text x={x + bw / 2} y={height + 14} textAnchor="middle" fill={T.t2} fontSize="9" fontFamily={T.mono}>
              {labels[i] || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segs, size = 108 }) {
  const cx = size / 2,
    cy = size / 2,
    r = size * 0.35,
    sw = size * 0.11,
    total = segs.reduce((a, s) => a + s.v, 0) || 1;
  let off = 0;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
      {segs.map((s, i) => {
        const dash = (s.v / total) * circ;
        const el = (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off * circ}
            style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`, filter: `drop-shadow(0 0 3px ${s.color}80)`, transition: "all 0.8s ease" }}
          />
        );
        off += s.v / total;
        return el;
      })}
    </svg>
  );
}

export function StatCard({ label, value, sub, icon, color, spark, delta }) {
  const T = useTheme();
  if (color === undefined) color = T.blue;
  return (
    <Card glow glowColor={color} style={{ flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spark ? 8 : 0 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: "#7EB0D9", textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>{label}</p>
          <p style={{ margin: "5px 0 2px", fontSize: 28, fontWeight: 900, color: "#F0F6FF", fontFamily: T.mono, letterSpacing: -1, lineHeight: 1, textShadow: "0 0 20px rgba(96,165,250,0.3)" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 11, color: T.t2, fontFamily: T.mono }}>{sub}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: color + "18", border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
          {delta !== undefined && (
            <span style={{ fontSize: 10, fontFamily: T.mono, color: delta >= 0 ? T.green : T.red }}>
              {delta >= 0 ? "↑" : "↓"}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </div>
      {spark && <SparkArea data={spark} color={color} height={30} width={120} />}
    </Card>
  );
}

// ─── WORKLOAD + PIPELINE + PR ────────────────────────────────────────────────

export function WorkloadHeatmap({ employees, projects }) {
  const T = useTheme();
  const empId = (emp) => String(emp._id || emp.id);
  const empProjects = (emp) => projects.filter((p) => p.team.some((m) => String(m.employee || m.eid || "") === empId(emp) || m.name === emp.name));
  return (
    <div>
      {employees.map((emp, i) => {
        const wl = emp.workload,
          col = wl >= 85 ? T.red : wl >= 70 ? T.amber : wl >= 50 ? T.cyan : T.green;
        const eps = empProjects(emp);
        return (
          <div key={empId(emp)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
            <Av initials={emp.avatar} size={28} idx={i} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#B8CCE8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>{emp.name}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: col, fontFamily: T.mono }}>{wl}%</span>
              </div>
              <Prg value={wl} color={col} h={4} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {eps.slice(0, 2).map((_, j) => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: ac(j) }} />
              ))}
              {eps.length > 0 && <span style={{ fontSize: 9, color: T.t3, fontFamily: T.mono, marginLeft: 2 }}>{eps.length}p</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Pipeline({ deploys }) {
  const T = useTheme();
  if (!deploys?.length) return <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono, margin: 0 }}>no deploys recorded</p>;
  const sc = { live: T.green, deploying: T.amber, failed: T.red, pending: T.t3 };
  const order = { production: 0, staging: 1, dev: 2 };
  const sorted = [...deploys].sort((a, b) => (order[a.env] || 9) - (order[b.env] || 9));
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {sorted.map((d, i) => {
        const c = sc[d.status] || T.t3;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 9, background: c + "18", border: `1.5px solid ${c}50`,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: 13,
                  boxShadow: d.status === "live" ? `0 0 10px ${c}40` : "none",
                }}
              >
                {d.status === "live" ? "✓" : d.status === "deploying" ? "⟳" : "✕"}
              </div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.t2, textTransform: "uppercase", fontFamily: T.mono }}>{d.env}</p>
              <p style={{ margin: "2px 0", fontSize: 11, fontWeight: 700, color: c, fontFamily: T.mono }}>{d.version}</p>
              <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono }}>{d.time}</p>
            </div>
            {i < sorted.length - 1 && <div style={{ height: 1, width: 20, background: T.cardBorder, flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );
}

export function PRList({ prs }) {
  const T = useTheme();
  if (!prs?.length) return <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono, margin: 0 }}>no pull requests</p>;
  const sc = { open: T.blue, merged: T.violet, review: T.amber, closed: T.t3 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {prs.map((pr, i) => (
        <div key={pr.id || i} style={{ display: "flex", gap: 10, padding: "9px 11px", background: "rgba(255,255,255,0.05)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: sc[pr.status] || T.t3, fontFamily: T.mono, fontWeight: 700, minWidth: 42, textTransform: "uppercase" }}>{pr.status}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F0F6FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: T.t3, fontFamily: T.mono }}>
              {pr.author} · {pr.comments} comments · {pr.changed} · {pr.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
