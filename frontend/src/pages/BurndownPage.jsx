import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { askAI } from "../services/aiService";
import { extractJSON } from "../utils/extractJSON";
import { dLeft } from "../utils/formatters";
import { Card, Select, Btn, Ring, Tag, Prg, VelocityChart } from "../components/ui/Primitives";

export default function BurndownPage() {
  const T = useTheme();
  const { projects } = useData();
  const [sel, setSel] = useState(projects.find((p) => p.status === "active")?._id || projects[0]?._id);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const project = projects.find((p) => p._id === sel) || projects[0];

  useEffect(() => {
    if (!sel && projects.length > 0) {
      setSel(projects.find((p) => p.status === "active")?._id || projects[0]._id);
    }
  }, [projects, sel]);

  const predict = async () => {
    if (!project || loading) return;
    setLoading(true);
    setForecast(null);
    const donePts = project.tasks.filter((t) => t.status === "done").reduce((a, t) => a + (t.points || 0), 0);
    const totalPts = project.tasks.reduce((a, t) => a + (t.points || 0), 0);
    const remainPts = totalPts - donePts;
    const avgVel = project.velocity?.reduce((a, b) => a + b, 0) / (project.velocity?.length || 1) || 10;
    const sys = `You are a project forecasting AI. Return ONLY valid JSON (no markdown):
{
  "completionDate": "YYYY-MM-DD",
  "confidence": <0-100>,
  "riskLevel": "low|medium|high|critical",
  "weeksToComplete": <number>,
  "onTime": <true|false>,
  "velocityTrend": "accelerating|stable|decelerating",
  "bottlenecks": ["string",...],
  "recommendations": ["string",...],
  "weeklyForecast": [{"week":1,"expectedPts":<n>,"cumulativePts":<n>},...]  // 8 weeks max
}`;
    const userMsg = `Project: ${project.name}
Deadline: ${project.deadline} (${dLeft(project.deadline)} days left)
Progress: ${project.progress}%
Story points: ${donePts}/${totalPts} done, ${remainPts} remaining
Velocity last 7 sprints: ${project.velocity?.join(", ") || "unknown"}
Avg velocity: ${avgVel.toFixed(1)} pts/sprint
Team size: ${project.team.length}
Budget burn: ${Math.round((project.spent / project.budget) * 100)}%
Priority: ${project.priority}`;

    try {
      const text = await askAI({ feature: "burndown", system: sys, messages: [{ role: "user", content: userMsg }], project: project._id, maxTokens: 1000 });
      const parsed = extractJSON(text);
      setForecast(parsed || { error: "Could not parse AI response" });
    } catch (e) {
      setForecast({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const donePts = project?.tasks.filter((t) => t.status === "done").reduce((a, t) => a + (t.points || 0), 0) || 0;
  const totalPts = project?.tasks.reduce((a, t) => a + (t.points || 0), 0) || 0;
  const riskCol = { low: T.green, medium: T.amber, high: T.red, critical: T.red };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Select Project</p>
            <Select value={sel} onChange={(e) => setSel(e.target.value)} options={projects.filter((p) => p.status === "active").map((p) => ({ value: p._id, label: p.name }))} />
          </div>
          {project && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                ["Progress", `${project.progress}%`, T.blue],
                ["Story Pts", `${donePts}/${totalPts}`, T.violet],
                ["Velocity", `${(project.velocity?.reduce((a, b) => a + b, 0) / (project.velocity?.length || 1) || 0).toFixed(1)}/sprint`, T.cyan],
                ["Days Left", `${dLeft(project.deadline)}`, dLeft(project.deadline) < 0 ? T.red : T.green],
              ].map(([l, v, c]) => (
                <div key={l}>
                  <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono, textTransform: "uppercase" }}>{l}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 800, color: c, fontFamily: T.mono }}>{v}</p>
                </div>
              ))}
            </div>
          )}
          <Btn onClick={predict} disabled={loading} style={{ flexShrink: 0 }}>
            {loading ? "Predicting…" : "✦ Predict Completion"}
          </Btn>
        </div>
      </Card>

      {project?.velocity && (
        <Card>
          <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Historical Velocity</p>
          <VelocityChart data={project.velocity} height={70} width={320} />
        </Card>
      )}

      {loading && (
        <Card style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 28, marginBottom: 10, color: T.violet }}>◆</div>
          <p style={{ margin: 0, fontSize: 13, color: T.violet, fontFamily: T.mono }}>Running ML forecast model…</p>
        </Card>
      )}

      {forecast?.error && (
        <Card style={{ borderColor: T.red + "40" }}>
          <p style={{ margin: 0, color: T.red, fontFamily: T.mono, fontSize: 12 }}>Error: {forecast.error}</p>
        </Card>
      )}

      {forecast && !forecast.error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card glow glowColor={riskCol[forecast.riskLevel] || T.blue}>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Forecast</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <Ring value={forecast.confidence} size={72} color={forecast.onTime ? T.green : T.red} thickness={5} />
              <div>
                <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono }}>Predicted completion</p>
                <p style={{ margin: "4px 0", fontSize: 18, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>{forecast.completionDate}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag label={forecast.onTime ? "On Time" : "At Risk"} color={forecast.onTime ? T.green : T.red} bg={(forecast.onTime ? T.green : T.red) + "18"} dot />
                  <Tag label={`${forecast.riskLevel} risk`} color={riskCol[forecast.riskLevel] || T.t3} bg={(riskCol[forecast.riskLevel] || T.t3) + "18"} />
                </div>
              </div>
            </div>
            {[
              ["Weeks to complete", `${forecast.weeksToComplete}w`],
              ["Velocity trend", forecast.velocityTrend],
              ["Confidence", `${forecast.confidence}%`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 11, color: T.t3, fontFamily: T.mono }}>{k}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.t2, fontFamily: T.mono, textTransform: "capitalize" }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card>
            <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Bottlenecks</p>
            {(forecast.bottlenecks || []).map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ color: T.red, fontFamily: T.mono, fontSize: 12, flexShrink: 0 }}>◈</span>
                <p style={{ margin: 0, fontSize: 12, color: T.t2 }}>{b}</p>
              </div>
            ))}
            <p style={{ margin: "14px 0 8px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Recommendations</p>
            {(forecast.recommendations || []).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ color: T.green, fontFamily: T.mono, fontSize: 12, flexShrink: 0 }}>◆</span>
                <p style={{ margin: 0, fontSize: 12, color: T.t2 }}>{r}</p>
              </div>
            ))}
          </Card>

          {forecast.weeklyForecast?.length > 0 && (
            <Card style={{ gridColumn: "1/-1" }}>
              <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Weekly Burndown Forecast</p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono }}>
                  <thead>
                    <tr>
                      {["Week", "Expected Pts", "Cumulative", "Progress"].map((h) => (
                        <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 9, fontWeight: 700, color: T.t3, textTransform: "uppercase", borderBottom: `1px solid ${T.cardBorder}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.weeklyForecast.map((w, i) => {
                      const pct = Math.round((w.cumulativePts / totalPts) * 100);
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
                          <td style={{ padding: "7px 10px", fontSize: 11, color: T.t3 }}>W{w.week}</td>
                          <td style={{ padding: "7px 10px", fontSize: 11, color: T.violet, fontWeight: 700 }}>+{w.expectedPts}</td>
                          <td style={{ padding: "7px 10px", fontSize: 11, color: T.t2 }}>
                            {w.cumulativePts}/{totalPts}
                          </td>
                          <td style={{ padding: "7px 10px", width: 160 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1 }}>
                                <Prg value={Math.min(pct, 100)} color={pct >= 100 ? T.green : T.blue} h={4} />
                              </div>
                              <span style={{ fontSize: 10, color: T.t2, minWidth: 30 }}>{Math.min(pct, 100)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
