import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { fmt, dLeft } from "../utils/formatters";
import { STATUS_CFG, TYPE_ICON } from "../utils/constants";
import { Card, StatCard, Ring, Tag, Prg, WorkloadHeatmap } from "../components/ui/Primitives";

const PROJECT_TYPES = ["Backend", "Full-Stack", "Fintech", "Infrastructure", "Data", "Security"];

export default function AnalyticsPage() {
  const T = useTheme();
  const { projects, employees } = useData();
  const totalBudget = projects.reduce((a, p) => a + p.budget, 0) || 1;
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const active = projects.filter((p) => p.status === "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total Projects" value={projects.length} icon="◎" color={T.blue} sub={`${active.length} active`} />
        <StatCard label="Total Budget" value={fmt(totalBudget)} icon="◆" color={T.green} sub="all projects" />
        <StatCard label="Total Spent" value={fmt(totalSpent)} icon="◈" color={T.amber} sub={`${Math.round((totalSpent / totalBudget) * 100)}% burn`} />
        <StatCard label="On Track" value={active.filter((p) => dLeft(p.deadline) > 0).length} icon="◉" color={T.cyan} sub={`${active.filter((p) => dLeft(p.deadline) < 0).length} overdue`} />
      </div>

      <Card>
        <p style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Progress Overview — All Projects</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          {projects.map((p) => {
            const col = p.progress >= 80 ? T.green : p.progress >= 50 ? T.blue : p.progress >= 30 ? T.amber : T.red;
            return (
              <div key={p._id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <Ring value={p.progress} size={72} color={col} thickness={5} />
                <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono, textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <Tag label={STATUS_CFG[p.status]?.label} color={STATUS_CFG[p.status]?.color} bg={STATUS_CFG[p.status]?.glow} small />
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Projects by Type</p>
          {PROJECT_TYPES.filter((t) => projects.some((p) => p.type === t)).map((t, i) => {
            const cnt = projects.filter((p) => p.type === t).length;
            const budget = projects.filter((p) => p.type === t).reduce((a, p) => a + p.budget, 0);
            const col = [T.blue, T.cyan, T.green, T.violet, T.amber, T.red][i % 6];
            return (
              <div key={t} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: T.t2, fontFamily: T.mono }}>
                    {TYPE_ICON[t] || "◎"} {t}
                  </span>
                  <span style={{ fontSize: 11, color: T.t2, fontFamily: T.mono }}>
                    {cnt} · {fmt(budget)}
                  </span>
                </div>
                <Prg value={(cnt / projects.length) * 100} color={col} h={6} />
              </div>
            );
          })}
        </Card>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Risk Matrix</p>
          {active.map((p) => {
            const d = dLeft(p.deadline),
              burn = Math.round((p.spent / (p.budget || 1)) * 100);
            const risk = (p.progress < 50 && d < 180) || burn > 85 ? T.red : (p.progress < 70 && d < 60) || burn > 70 ? T.amber : T.green;
            const riskLabel = risk === T.red ? "High" : risk === T.amber ? "Medium" : "Low";
            return (
              <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: risk, flexShrink: 0, boxShadow: `0 0 6px ${risk}` }} />
                <span style={{ fontSize: 11, color: T.t2, fontFamily: T.mono, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, flexShrink: 0 }}>{burn}% burn</span>
                <span style={{ fontSize: 10, fontFamily: T.mono, color: d < 0 ? T.red : d < 30 ? T.amber : T.t3, flexShrink: 0 }}>{d < 0 ? `${-d}d late` : `${d}d`}</span>
                <Tag label={riskLabel} color={risk} bg={risk + "18"} small />
              </div>
            );
          })}
        </Card>
      </div>

      <Card>
        <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Engineer Workload</p>
        <WorkloadHeatmap employees={employees} projects={projects} />
      </Card>
    </div>
  );
}
