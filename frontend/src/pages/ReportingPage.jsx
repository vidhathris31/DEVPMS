import { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { askAI } from "../services/aiService";
import { extractJSON } from "../utils/extractJSON";
import { dLeft } from "../utils/formatters";
import { Card, StatCard, Select, Btn, Tag } from "../components/ui/Primitives";

export default function ReportingPage() {
  const T = useTheme();
  const { projects, employees } = useData();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("health");

  const generate = async () => {
    setLoading(true);
    setReport(null);
    const sys = `You are a project reporting AI. Generate a detailed ${reportType} report.
Return ONLY valid JSON (no markdown):
{
  "title": "...",
  "generatedAt": "ISO datetime",
  "executiveSummary": "3-4 sentences",
  "keyMetrics": [{"label":"...","value":"...","trend":"up|down|stable","color":"green|amber|red"}],
  "sections": [{"heading":"...","content":"...","rating":"good|warning|critical"}],
  "recommendations": ["..."],
  "riskFlags": ["..."]
}`;
    const msg = `Generate a ${reportType} report for this portfolio:
${projects.map((p) => `${p.name}: ${p.progress}% complete, budget burn ${Math.round((p.spent / p.budget) * 100)}%, ${dLeft(p.deadline)}d to deadline, ${p.tasks.filter((t) => t.status === "done").length}/${p.tasks.length} tasks done, velocity trend: ${p.velocity?.slice(-3).join("→")}`).join("\n")}
Team: ${employees.length} engineers, avg workload ${Math.round(employees.reduce((a, e) => a + e.workload, 0) / (employees.length || 1))}%`;

    try {
      const text = await askAI({ feature: "reports", system: sys, messages: [{ role: "user", content: msg }], maxTokens: 1500 });
      const parsed = extractJSON(text);
      setReport(parsed || { error: "Could not parse AI response" });
    } catch (e) {
      setReport({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const ratingColor = { good: T.green, warning: T.amber, critical: T.red };
  const trendIcon = { up: "↑", down: "↓", stable: "→" };
  const trendColor = { up: T.green, down: T.red, stable: T.amber };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Projects Tracked" value={projects.length} icon="📋" color={T.blue} />
        <StatCard label="Completion Rate" value={`${Math.round((projects.filter((p) => p.status === "shipped").length / (projects.length || 1)) * 100)}%`} icon="✅" color={T.green} />
        <StatCard label="On-Time Projects" value={projects.filter((p) => p.status === "active" && dLeft(p.deadline) > 0).length} icon="⏰" color={T.cyan} />
        <StatCard label="Avg Team Load" value={`${Math.round(employees.reduce((a, e) => a + e.workload, 0) / (employees.length || 1))}%`} icon="👥" color={T.amber} />
      </div>


          <Card style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Report Type</p>
                <Select
                  value={reportType} onChange={(e) => setReportType(e.target.value)}
                  options={[{ value: "health", label: "Project Health Report" }, { value: "velocity", label: "Team Velocity Report" }, { value: "budget", label: "Budget & Finance Report" }, { value: "risk", label: "Risk Assessment Report" }, { value: "performance", label: "Team Performance Report" }]}
                />
              </div>
              <Btn onClick={generate} disabled={loading} style={{ flexShrink: 0 }}>
                {loading ? "Generating…" : "✦ Generate AI Report"}
              </Btn>
            </div>
          </Card>

          {loading && (
            <Card style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 28, marginBottom: 12, color: T.violet, animation: "devpms-spin 2s linear infinite" }}>◈</div>
              <p style={{ margin: 0, fontSize: 14, color: T.violet, fontFamily: T.mono }}>groq is generating your {reportType} report…</p>
              <style>{`@keyframes devpms-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </Card>
          )}

          {report?.error && (
            <Card>
              <p style={{ margin: 0, color: T.red, fontFamily: T.mono, fontSize: 13 }}>Error: {report.error}</p>
            </Card>
          )}

          {report && !report.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card glow glowColor={T.violet}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: T.t1, letterSpacing: -0.3 }}>{report.title}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>Generated {report.generatedAt}</p>
                  </div>
                  <Tag label="AI Generated" color={T.violet} bg={T.violetGlow} />
                </div>
                <p style={{ margin: 0, fontSize: 14, color: T.t2, lineHeight: 1.7, paddingTop: 12, borderTop: `1px solid ${T.cardBorder}` }}>{report.executiveSummary}</p>
              </Card>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                {(report.keyMetrics || []).map((m, i) => (
                  <Card key={i} glow glowColor={m.color === "green" ? T.green : m.color === "red" ? T.red : T.amber}>
                    <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.8 }}>{m.label}</p>
                    <p style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: 900, color: T.t1, fontFamily: T.mono, letterSpacing: -1 }}>{m.value}</p>
                    <span style={{ fontSize: 13, color: trendColor[m.trend] || T.t3, fontFamily: T.mono, fontWeight: 700 }}>
                      {trendIcon[m.trend] || "→"} {m.trend}
                    </span>
                  </Card>
                ))}
              </div>

              {(report.sections || []).map((s, i) => (
                <Card key={i} style={{ borderLeft: `3px solid ${ratingColor[s.rating] || T.t3}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.t1 }}>{s.heading}</p>
                    <Tag label={s.rating} color={ratingColor[s.rating] || T.t3} bg={(ratingColor[s.rating] || T.t3) + "20"} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: T.t2, lineHeight: 1.6 }}>{s.content}</p>
                </Card>
              ))}

              {(report.recommendations?.length > 0 || report.riskFlags?.length > 0) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {report.recommendations?.length > 0 && (
                    <Card>
                      <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Recommendations</p>
                      {report.recommendations.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                          <span style={{ color: T.green, fontFamily: T.mono, fontSize: 13, flexShrink: 0 }}>◆</span>
                          <p style={{ margin: 0, fontSize: 13, color: T.t2 }}>{r}</p>
                        </div>
                      ))}
                    </Card>
                  )}
                  {report.riskFlags?.length > 0 && (
                    <Card>
                      <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Risk Flags</p>
                      {report.riskFlags.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                          <span style={{ color: T.amber, fontFamily: T.mono, fontSize: 13, flexShrink: 0 }}>⚠</span>
                          <p style={{ margin: 0, fontSize: 13, color: T.t2 }}>{r}</p>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
    </div>
  );
}
