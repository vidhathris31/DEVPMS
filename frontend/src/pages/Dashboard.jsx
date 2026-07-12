import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { fmt, dLeft } from "../utils/formatters";
import { TYPE_ICON } from "../utils/constants";
import { Card, StatCard, Donut, Prg, WorkloadHeatmap, StackTag, LiveClock } from "../components/ui/Primitives";

export default function Dashboard() {
  const T = useTheme();
  const navigate = useNavigate();
  const { projects, employees, feed } = useData();

  const active = projects.filter((p) => p.status === "active");
  const shipped = projects.filter((p) => p.status === "shipped");
  const paused = projects.filter((p) => p.status === "paused");
  const totalBudget = projects.reduce((a, p) => a + p.budget, 0) || 1;
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const overdue = active.filter((p) => dLeft(p.deadline) < 0);
  const near = active.filter((p) => {
    const d = dLeft(p.deadline);
    return d >= 0 && d <= 30;
  });
  const avgProg = Math.round(active.reduce((a, p) => a + p.progress, 0) / (active.length || 1));
  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0) || 1;
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter((t) => t.status === "done").length, 0);

  const onOpenProject = (p) => navigate(`/projects/${p._id}`);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {(overdue.length > 0 || near.length > 0) && (
        <div style={{ background: "linear-gradient(90deg,rgba(248,113,113,0.08),rgba(251,191,36,0.04))", border: `1px solid ${T.red}30`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, filter: `drop-shadow(0 0 8px ${T.red})` }}>◈</span>
          <div style={{ flex: 1 }}>
            {overdue.length > 0 && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#FC8181", fontFamily: T.mono }}>
                {overdue.length} project{overdue.length > 1 ? "s" : ""} overdue — {overdue.map((p) => p.name).join(", ")}
              </p>
            )}
            {near.length > 0 && (
              <p style={{ margin: overdue.length ? 3 : 0, fontSize: 12, color: "#FCD34D", fontFamily: T.mono, fontWeight: 600 }}>
                {near.length} deadline{near.length > 1 ? "s" : ""} within 30 days
              </p>
            )}
          </div>
          <LiveClock />
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Active" value={active.length} icon="◎" color={T.cyan} sub={`${shipped.length} shipped · ${paused.length} paused`} spark={[2, 3, 3, 4, 4, active.length]} delta={8} />
        <StatCard label="Avg Progress" value={`${avgProg}%`} icon="◈" color={T.blue} sub={`${overdue.length} overdue · ${near.length} near`} spark={[45, 50, 54, 58, 62, avgProg]} />
        <StatCard label="Total Budget" value={fmt(totalBudget)} icon="◆" color={T.green} sub={`${fmt(totalSpent)} spent (${Math.round((totalSpent / totalBudget) * 100)}%)`} />
        <StatCard label="Tasks" value={`${doneTasks}/${totalTasks}`} icon="◉" color={T.violet} sub={`${Math.round((doneTasks / totalTasks) * 100)}% completion`} spark={[20, 28, 34, 40, 48, doneTasks]} delta={5} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Portfolio</p>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: 108, height: 108, flexShrink: 0 }}>
              <Donut size={108} segs={[{ v: active.length, color: T.cyan }, { v: shipped.length, color: T.green }, { v: paused.length, color: T.amber }]} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: T.t1, fontFamily: T.mono }}>{projects.length}</span>
                <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>projects</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[["Active", active.length, T.cyan], ["Shipped", shipped.length, T.green], ["Paused", paused.length, T.amber]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: c, display: "inline-block", boxShadow: `0 0 5px ${c}` }} />
                    <span style={{ fontSize: 13, color: T.t2, fontFamily: T.mono }}>{l}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.cardBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>budget burn</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.green, fontFamily: T.mono }}>{Math.round((totalSpent / totalBudget) * 100)}%</span>
                </div>
                <Prg value={Math.round((totalSpent / totalBudget) * 100)} color={T.green} h={5} />
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Engineer Workload</p>
          <WorkloadHeatmap employees={employees} projects={projects} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Active Projects</p>
          {active.map((p, i) => {
            const d = dLeft(p.deadline);
            return (
              <div
                key={p._id}
                onClick={() => onOpenProject(p)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < active.length - 1 ? `1px solid ${T.cardBorder}` : "none", cursor: "pointer", transition: "padding-left 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = "6px")}
                onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = "0")}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: T.blueGlow, border: `1px solid ${T.blue}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: T.cyan, flexShrink: 0 }}>
                  {TYPE_ICON[p.type] || "◎"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.name}</p>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.t1, fontFamily: T.mono, flexShrink: 0 }}>{p.progress}%</span>
                  </div>
                  <Prg value={p.progress} h={4} />
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {p.stack.slice(0, 2).map((s) => (
                      <StackTag key={s} label={s} />
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: d < 0 ? T.red : d < 30 ? T.amber : T.t3, fontFamily: T.mono, flexShrink: 0, minWidth: 50, textAlign: "right" }}>{d < 0 ? `${-d}d late` : `${d}d`}</p>
              </div>
            );
          })}
        </Card>

        <Card noPad>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "9px 14px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 6, borderRadius: "14px 14px 0 0" }}>
            {[T.red, T.amber, T.green].map((c, i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", boxShadow: i === 2 ? `0 0 5px ${c}` : "" }} />
            ))}
            <span style={{ fontSize: 10, color: T.t3, marginLeft: 8, fontFamily: T.mono }}>activity.log</span>
            <span style={{ marginLeft: "auto", fontSize: 9, color: T.green, fontFamily: T.mono }}>● live</span>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
            {feed.length === 0 && <p style={{ margin: 0, fontSize: 11, color: T.t3, fontFamily: T.mono }}>no recent activity this session</p>}
            {feed.slice(0, 7).map((a, i) => (
              <div key={a.id} style={{ display: "flex", gap: 8, paddingBottom: i < 6 ? 7 : 0, borderBottom: i < 6 ? `1px solid ${T.cardBorder}` : "none" }}>
                <span style={{ fontSize: 12, color: a.color || T.cyan, fontFamily: T.mono, flexShrink: 0, marginTop: 1, filter: `drop-shadow(0 0 8px ${a.color || T.cyan})` }}>{a.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: T.t2, fontFamily: T.mono, lineHeight: 1.5 }}>{a.text}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 9, color: T.t3, fontFamily: T.mono }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
