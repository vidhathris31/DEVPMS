import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { askAI } from "../services/aiService";
import { extractJSON } from "../utils/extractJSON";
import { Card, Select, Btn, Ring } from "../components/ui/Primitives";

const CATEGORIES = ["security", "performance", "maintainability"];

export default function CodeReviewPage() {
  const T = useTheme();
  const { projects } = useData();
  const [diff, setDiff] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?._id || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("security");

  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0]._id);
  }, [projects, projectId]);

  const analyze = async () => {
    if (!diff.trim() || loading) return;
    const project = projects.find((p) => p._id === projectId) || projects[0];
    if (!project) return;
    setLoading(true);
    setResult(null);
    const sys = `You are an expert code reviewer specializing in security, performance, and maintainability.
Project context: ${project.name} — stack: ${project.stack.join(", ")}.
Analyze the provided diff and return ONLY a valid JSON object (no markdown, no backticks) with this exact shape:
{
  "score": <number 0-100 overall code quality>,
  "security": {"score":<0-100>,"issues":[{"severity":"critical|high|medium|low","title":"...","line":"...","fix":"..."}]},
  "performance": {"score":<0-100>,"issues":[{"severity":"high|medium|low","title":"...","line":"...","fix":"..."}]},
  "maintainability": {"score":<0-100>,"issues":[{"severity":"high|medium|low","title":"...","line":"...","fix":"..."}]},
  "summary": "2-3 sentence overall assessment",
  "approved": <true|false>
}`;
    try {
      const text = await askAI({ feature: "code-review", system: sys, messages: [{ role: "user", content: `Analyze this diff:\n\n${diff}` }], project: project._id, maxTokens: 1500 });
      const parsed = extractJSON(text);
      setResult(parsed || { error: "Could not parse AI response" });
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const sevColor = { critical: T.red, high: T.amber, medium: T.blue, low: T.t3 };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Project Context</p>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} options={projects.map((p) => ({ value: p._id, label: `${p.name} — ${p.stack.slice(0, 2).join(", ")}` }))} />
        </Card>
        <Card noPad style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 14px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 6, borderRadius: "14px 14px 0 0" }}>
            {[T.red, T.amber, T.green].map((c, i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
            ))}
            <span style={{ fontSize: 10, color: T.t3, marginLeft: 8, fontFamily: T.mono }}>diff.patch</span>
          </div>
          <textarea
            value={diff} onChange={(e) => setDiff(e.target.value)}
            placeholder={"Paste your git diff here...\n\n@@ -1,8 +1,12 @@\n-const token = req.query.token;\n+const token = req.headers['x-auth-token'];\n ..."}
            style={{ flex: 1, border: "none", padding: "14px", fontSize: 12, fontFamily: T.mono, background: "transparent", color: T.cyan, resize: "none", outline: "none", minHeight: 280, lineHeight: 1.6 }}
          />
        </Card>
        <Btn onClick={analyze} disabled={!diff.trim() || loading || projects.length === 0} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Analyzing…" : "⬡ Run AI Code Review"}
        </Btn>
        {!result && !loading && (
          <Card style={{ padding: "12px 14px" }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>What it checks</p>
            {[
              ["◉ Security", "SQL injection, XSS, auth bypasses, secrets exposure"],
              ["◈ Performance", "N+1 queries, memory leaks, blocking ops, complexity"],
              ["◆ Maintainability", "Dead code, naming, coupling, test coverage gaps"],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 11, color: T.cyan, fontFamily: T.mono, flexShrink: 0 }}>{t.split(" ")[0]}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: T.t2 }}>{t.split(" ").slice(1).join(" ")}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: T.t3 }}>{d}</p>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div>
        {loading && (
          <Card style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 32, marginBottom: 12, animation: "devpms-spin 2s linear infinite" }}>◈</div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.cyan, fontFamily: T.mono }}>Analyzing diff with groq…</p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>checking security · performance · maintainability</p>
            <style>{`@keyframes devpms-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </Card>
        )}

        {result?.error && (
          <Card style={{ borderColor: T.red + "40" }}>
            <p style={{ margin: 0, color: T.red, fontFamily: T.mono, fontSize: 12 }}>Error: {result.error}</p>
          </Card>
        )}

        {result && !result.error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card glow glowColor={result.score >= 80 ? T.green : result.score >= 60 ? T.amber : T.red}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Ring value={result.score} size={80} color={result.score >= 80 ? T.green : result.score >= 60 ? T.amber : T.red} thickness={5} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.t1 }}>Code Quality Score</span>
                    <span
                      style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: result.approved ? T.greenGlow : T.redGlow, color: result.approved ? T.green : T.red, border: `1px solid ${result.approved ? T.green : T.red}40`, fontFamily: T.mono }}
                    >
                      {result.approved ? "✓ APPROVED" : "✗ NEEDS WORK"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: T.t2, lineHeight: 1.6 }}>{result.summary}</p>
                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    {CATEGORIES.map((cat) => (
                      <div key={cat}>
                        <span style={{ fontSize: 9, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>{cat}</span>
                        <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: result[cat]?.score >= 80 ? T.green : result[cat]?.score >= 60 ? T.amber : T.red, fontFamily: T.mono }}>{result[cat]?.score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.cardBorder}` }}>
              {CATEGORIES.map((cat) => {
                const issues = result[cat]?.issues || [];
                const hasErr = issues.some((i) => i.severity === "critical" || i.severity === "high");
                return (
                  <button
                    key={cat} onClick={() => setTab(cat)}
                    style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === cat ? T.blue : "transparent"}`, color: tab === cat ? T.blue : T.t3, fontWeight: tab === cat ? 700 : 400, fontSize: 11, padding: "8px 14px", cursor: "pointer", marginBottom: -1, textTransform: "capitalize", letterSpacing: 0.5, fontFamily: T.mono }}
                  >
                    {cat} {issues.length > 0 && <span style={{ marginLeft: 3, background: hasErr ? T.red : T.amber, color: "#fff", borderRadius: 8, fontSize: 9, padding: "1px 4px" }}>{issues.length}</span>}
                  </button>
                );
              })}
            </div>

            <Card>
              {(result[tab]?.issues || []).length === 0
                ? <p style={{ margin: 0, color: T.green, fontFamily: T.mono, fontSize: 12 }}>✓ No {tab} issues found</p>
                : (result[tab]?.issues || []).map((issue, i) => (
                    <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: sevColor[issue.severity] || T.t3, fontFamily: T.mono, textTransform: "uppercase" }}>{issue.severity}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.t1 }}>{issue.title}</span>
                        {issue.line && <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, marginLeft: "auto" }}>line {issue.line}</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: T.cyan, fontFamily: T.mono, background: T.cyanGlow, padding: "6px 10px", borderRadius: 6, border: `1px solid ${T.cyan}20` }}>fix → {issue.fix}</p>
                    </div>
                  ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
