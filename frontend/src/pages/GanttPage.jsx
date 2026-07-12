import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { fmtD, dLeft, clamp } from "../utils/formatters";
import { TYPE_ICON } from "../utils/constants";
import { Card, StatCard, Tag } from "../components/ui/Primitives";

export default function GanttPage() {
  const T = useTheme();
  const { projects } = useData();
  const active = projects.filter((p) => p.status === "active" || p.status === "shipped");

  if (active.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: T.t3 }}>
        <p style={{ fontFamily: T.mono, fontSize: 12 }}>No active or shipped projects to chart yet.</p>
      </div>
    );
  }

  const allDates = active.flatMap((p) => [new Date(p.start), new Date(p.deadline)]);
  const minD = new Date(Math.min(...allDates)),
    maxD = new Date(Math.max(...allDates));
  const span = maxD - minD || 1,
    now = new Date();
  const nowPct = clamp(((now - minD) / span) * 100, 0, 100);
  const months = [];
  let cur = new Date(minD);
  cur.setDate(1);
  while (cur <= maxD) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Projects" value={active.length} icon="📊" color={T.blue} sub="on timeline" />
        <StatCard label="Date Range" value={`${months.length}mo`} icon="📅" color={T.cyan} sub={`${fmtD(minD)} → ${fmtD(maxD)}`} />
        <StatCard label="Overdue" value={active.filter((p) => dLeft(p.deadline) < 0).length} icon="⚠️" color={T.red} sub="past deadline" />
        <StatCard
          label="On Track"
          value={active.filter((p) => dLeft(p.deadline) > 0 && p.progress >= 100 - (dLeft(p.deadline) / ((new Date(p.deadline) - new Date(p.start)) / 86400000)) * 100 - 10).length}
          icon="✅" color={T.green} sub="within target"
        />
      </div>

      <Card noPad>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Interactive Gantt Chart</p>
          <div style={{ display: "flex", gap: 12, marginLeft: "auto", flexWrap: "wrap" }}>
            {[[T.blue, "Progress"], [T.amber, "▲ Today"], [T.green, "On Track"], [T.red, "Overdue"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: c === T.amber ? 2 : 10, height: c === T.amber ? 14 : 6, borderRadius: c === T.amber ? 1 : 3, background: c, display: "inline-block", boxShadow: `0 0 4px ${c}60` }} />
                <span style={{ fontSize: 11, color: T.t2, fontFamily: T.mono }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "0 16px", overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, paddingTop: 12, paddingBottom: 4 }}>
            <div />
            <div style={{ position: "relative", height: 24 }}>
              {months.map((m, i) => {
                const pct = ((m - minD) / span) * 100;
                return (
                  <div key={i} style={{ position: "absolute", left: `${pct}%`, fontSize: 10, color: T.t3, fontFamily: T.mono, whiteSpace: "nowrap", transform: "translateX(-50%)", top: 0 }}>
                    {m.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                  </div>
                );
              })}
            </div>
          </div>

          {active.map((p) => {
            const s = new Date(p.start),
              e = new Date(p.deadline);
            const left = ((s - minD) / span) * 100,
              width = ((e - s) / span) * 100;
            const isOverdue = dLeft(p.deadline) < 0;
            const sc = isOverdue ? T.red : p.status === "shipped" ? T.green : T.blue;
            const totalDays = (e - s) / 86400000 || 1;
            const elapsedDays = (now - s) / 86400000;
            const expectedProg = clamp((elapsedDays / totalDays) * 100, 0, 100);
            const onTrack = p.progress >= expectedProg - 10;
            return (
              <div key={p._id} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: T.cyan }}>{TYPE_ICON[p.type] || "◎"}</span>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                    <Tag label={`${p.progress}%`} color={onTrack ? T.green : T.amber} bg={(onTrack ? T.green : T.amber) + "18"} small />
                    <Tag label={isOverdue ? `${-dLeft(p.deadline)}d late` : `${dLeft(p.deadline)}d`} color={isOverdue ? T.red : T.t3} bg={(isOverdue ? T.red : T.t3) + "18"} small />
                  </div>
                </div>
                <div style={{ position: "relative", height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6 }}>
                  {months.map((m, i) => {
                    const pct = ((m - minD) / span) * 100;
                    return <div key={i} style={{ position: "absolute", left: `${pct}%`, top: 0, height: "100%", width: 1, background: "rgba(255,255,255,0.06)" }} />;
                  })}
                  <div style={{ position: "absolute", left: `${left}%`, width: `${width}%`, height: "100%", background: sc + "15", borderRadius: 6, border: `1px solid ${sc}30` }} />
                  <div style={{ position: "absolute", left: `${left}%`, width: `${width * (p.progress / 100)}%`, height: "100%", background: `linear-gradient(90deg,${sc}BB,${sc})`, borderRadius: 6, boxShadow: `0 0 10px ${sc}50`, transition: "width 0.8s ease" }} />
                  <div style={{ position: "absolute", left: `${nowPct}%`, top: -4, width: 2, height: 36, background: T.amber, boxShadow: `0 0 8px ${T.amber}`, zIndex: 2, borderRadius: 1 }} />
                  <div style={{ position: "absolute", left: `${left + 1}%`, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: T.mono, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap" }}>{fmtD(s)}</div>
                  <div style={{ position: "absolute", right: `${100 - left - width + 1}%`, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: T.mono, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap" }}>{fmtD(e)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>All Project Milestones</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {active.map((p) => (
            <div key={p._id} style={{ background: "rgba(255,255,255,0.03)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: T.cyan }}>{TYPE_ICON[p.type] || "◎"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              </div>
              {p.milestones.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <div
                    style={{ width: 16, height: 16, borderRadius: "50%", background: m.done ? T.green + "20" : p.progress >= m.pct ? T.amber + "20" : T.bg, border: `2px solid ${m.done ? T.green : p.progress >= m.pct ? T.amber : T.t4}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: m.done ? `0 0 8px ${T.green}50` : "" }}
                  >
                    {m.done && <span style={{ fontSize: 8, color: T.green, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: m.done ? T.green : p.progress >= m.pct ? T.amber : T.t3, fontWeight: m.done ? 700 : 500, flex: 1 }}>{m.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.t3, fontFamily: T.mono }}>{m.pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
