import { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { askAI } from "../services/aiService";
import { extractJSON } from "../utils/extractJSON";
import { Card, Btn, Ring, Tag, Prg } from "../components/ui/Primitives";

export default function TechDebtPage() {
  const T = useTheme();
  const { projects } = useData();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const scan = async () => {
    if (loading) return;
    setLoading(true);
    setReport(null);
    const sys = `You are a technical debt analyzer. Given project data, compute a tech debt score.
Return ONLY valid JSON:
{
  "projects": [
    {
      "name": "...",
      "debtScore": <0-100, higher=more debt>,
      "grade": "A|B|C|D|F",
      "categories": {
        "codeAge": <0-100>,
        "testCoverage": <0-100>,
        "dependencies": <0-100>,
        "documentation": <0-100>,
        "security": <0-100>
      },
      "topIssues": ["..."],
      "recommendation": "..."
    }
  ],
  "portfolioDebtScore": <0-100>,
  "criticalProjects": ["project names"],
  "summary": "..."
}`;
    const msg = `Analyze tech debt for these projects:
${projects
  .map(
    (p) => `
Project: ${p.name}
Stack: ${p.stack.join(", ")}
Status: ${p.status}
Started: ${p.start}
Progress: ${p.progress}%
Open PRs: ${p.prs?.filter((pr) => pr.status === "open").length || 0}
Merged PRs (30d): ${p.prs?.filter((pr) => pr.status === "merged").length || 0}
Tasks todo/backlog: ${p.tasks.filter((t) => t.status === "todo").length}
In-progress tasks: ${p.tasks.filter((t) => t.status === "active").length}
Budget burn: ${Math.round((p.spent / (p.budget || 1)) * 100)}%
Notes: ${p.notes || "none"}
`
  )
  .join("\n---\n")}`;

    try {
      const text = await askAI({ feature: "tech-debt", system: sys, messages: [{ role: "user", content: msg }], maxTokens: 2000 });
      const parsed = extractJSON(text);
      setReport(parsed || { error: "Could not parse AI response" });
    } catch (e) {
      setReport({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = { A: T.green, B: T.cyan, C: T.amber, D: T.red, F: T.red };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.t1 }}>Tech Debt Scanner</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>AI analyzes {projects.length} projects for debt signals across 5 dimensions</p>
        </div>
        <Btn onClick={scan} disabled={loading}>
          {loading ? "Scanning…" : "◉ Scan All Projects"}
        </Btn>
      </Card>

      {!report && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {[
            ["Code Age", "How long since significant refactor"],
            ["Test Coverage", "Estimated test coverage gaps"],
            ["Dependencies", "Outdated/vulnerable packages"],
            ["Documentation", "Missing docs, stale READMEs"],
            ["Security", "Known vulnerability patterns"],
          ].map(([t, d]) => (
            <Card key={t}>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: T.cyan }}>{t}</p>
              <p style={{ margin: 0, fontSize: 11, color: T.t3 }}>{d}</p>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <Card style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 28, marginBottom: 12, color: T.amber, animation: "devpms-spin 2s linear infinite" }}>◆</div>
          <p style={{ margin: 0, fontSize: 13, color: T.amber, fontFamily: T.mono }}>Scanning tech debt across all projects…</p>
          <style>{`@keyframes devpms-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </Card>
      )}

      {report?.error && (
        <Card>
          <p style={{ margin: 0, color: T.red, fontFamily: T.mono, fontSize: 12 }}>Error: {report.error}</p>
        </Card>
      )}

      {report && !report.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card glow glowColor={report.portfolioDebtScore > 70 ? T.red : report.portfolioDebtScore > 40 ? T.amber : T.green}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Ring value={100 - report.portfolioDebtScore} size={80} color={report.portfolioDebtScore > 70 ? T.red : report.portfolioDebtScore > 40 ? T.amber : T.green} thickness={5} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.6 }}>Portfolio Health Score</p>
                <p style={{ margin: "4px 0 6px", fontSize: 13, color: T.t2 }}>{report.summary}</p>
                {report.criticalProjects?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: T.red, fontFamily: T.mono }}>Critical:</span>
                    {report.criticalProjects.map((n) => (
                      <Tag key={n} label={n} color={T.red} bg={T.redGlow} small />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
            {(report.projects || []).map((p, i) => {
              const gc = gradeColor[p.grade] || T.t3;
              return (
                <Card key={p.name || i} glow glowColor={gc}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1 }}>{p.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>debt score: {p.debtScore}/100</p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: gc + "18", border: `2px solid ${gc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: gc, fontFamily: T.mono }}>{p.grade}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                    {Object.entries(p.categories || {}).map(([cat, val]) => {
                      const cc = val > 70 ? T.red : val > 40 ? T.amber : T.green;
                      return (
                        <div key={cat} style={{ display: "grid", gridTemplateColumns: "110px 1fr 32px", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "capitalize" }}>{cat}</span>
                          <Prg value={val} color={cc} h={4} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: cc, fontFamily: T.mono, textAlign: "right" }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10 }}>
                    {(p.topIssues || []).slice(0, 2).map((issue, i2) => (
                      <p key={i2} style={{ margin: "0 0 4px", fontSize: 11, color: T.amber }}>
                        ⚠ {issue}
                      </p>
                    ))}
                    {p.recommendation && <p style={{ margin: "6px 0 0", fontSize: 11, color: T.cyan, fontFamily: T.mono, background: T.cyanGlow, padding: "6px 8px", borderRadius: 6 }}>↳ {p.recommendation}</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
