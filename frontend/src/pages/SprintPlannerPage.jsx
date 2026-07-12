import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { askAI } from "../services/aiService";
import { extractJSON } from "../utils/extractJSON";
import { Card, Select, Btn, Av } from "../components/ui/Primitives";

export default function SprintPlannerPage() {
  const T = useTheme();
  const { projects } = useData();
  const [sel, setSel] = useState(projects.find((p) => p.status === "active")?._id || projects[0]?._id);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [sprintLen, setSprintLen] = useState("14");
  const project = projects.find((p) => p._id === sel) || projects[0];

  useEffect(() => {
    if (!sel && projects.length > 0) {
      setSel(projects.find((p) => p.status === "active")?._id || projects[0]._id);
    }
  }, [projects, sel]);

  const generate = async () => {
    if (!project || loading) return;
    setLoading(true);
    setPlan(null);
    const backlog = project.tasks.filter((t) => t.status !== "done");
    const avgVel = project.velocity?.reduce((a, b) => a + b, 0) / (project.velocity?.length || 1) || 10;
    const sys = `You are an Agile sprint planner AI. Given a backlog and team velocity, generate an optimal sprint plan.
Return ONLY valid JSON (no markdown):
{
  "sprints": [
    {
      "number": 1,
      "goal": "short sprint goal",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "tasks": [
        {"taskId": "...", "title": "...", "assignee": "...", "points": <n>, "rationale": "..."}
      ],
      "totalPoints": <n>,
      "risks": ["..."]
    }
  ],
  "totalSprints": <n>,
  "projectedCompletion": "YYYY-MM-DD",
  "planningNotes": "overall strategy note"
}`;
    const msg = `Project: ${project.name}
Team: ${project.team.map((m) => `${m.name}(${m.role})`).join(", ")}
Avg velocity: ${avgVel.toFixed(1)} pts/sprint
Sprint length: ${sprintLen} days
Start date: ${new Date().toISOString().split("T")[0]}

Backlog (todo + in-progress tasks):
${backlog.map((t) => `- id:${t._id} "${t.title}" [${t.points || 3}pts, assignee:${t.assignee}]`).join("\n")}

Create an optimal sprint plan distributing tasks across sprints. Keep each sprint ≤ ${Math.round(avgVel * 1.1)} pts.`;

    try {
      const text = await askAI({ feature: "sprint-planner", system: sys, messages: [{ role: "user", content: msg }], project: project._id, maxTokens: 2000 });
      const parsed = extractJSON(text);
      setPlan(parsed || { error: "Could not parse AI response" });
    } catch (e) {
      setPlan({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Project</p>
            <Select value={sel} onChange={(e) => setSel(e.target.value)} options={projects.filter((p) => p.status === "active").map((p) => ({ value: p._id, label: p.name }))} />
          </div>
          <div style={{ width: 140 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Sprint Length</p>
            <Select value={sprintLen} onChange={(e) => setSprintLen(e.target.value)} options={[{ value: "7", label: "1 week" }, { value: "14", label: "2 weeks" }, { value: "21", label: "3 weeks" }]} />
          </div>
          <Btn onClick={generate} disabled={loading}>
            {loading ? "Planning…" : "✦ Auto-Plan Sprints"}
          </Btn>
        </div>
        {project && (
          <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.cardBorder}`, flexWrap: "wrap" }}>
            {[
              ["Backlog", project.tasks.filter((t) => t.status !== "done").length + " tasks"],
              ["Remaining Pts", project.tasks.filter((t) => t.status !== "done").reduce((a, t) => a + (t.points || 0), 0) + "pts"],
              ["Avg Velocity", ((project.velocity?.reduce((a, b) => a + b, 0) || 0) / (project.velocity?.length || 1)).toFixed(1) + "/sprint"],
              ["Team", project.team.length + " members"],
            ].map(([l, v]) => (
              <div key={l}>
                <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono, textTransform: "uppercase" }}>{l}</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {loading && (
        <Card style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 28, marginBottom: 12, color: T.violet, animation: "devpms-spin 2s linear infinite" }}>◉</div>
          <p style={{ margin: 0, fontSize: 13, color: T.violet, fontFamily: T.mono }}>groq is planning your sprints…</p>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>optimizing for velocity · workload balance · deadline</p>
          <style>{`@keyframes devpms-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </Card>
      )}

      {plan?.error && (
        <Card style={{ borderColor: T.red + "40" }}>
          <p style={{ margin: 0, color: T.red, fontFamily: T.mono, fontSize: 12 }}>Error: {plan.error}</p>
        </Card>
      )}

      {plan && !plan.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.6 }}>Auto-generated sprint plan</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: T.t2 }}>{plan.planningNotes}</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono, textTransform: "uppercase" }}>Sprints</p>
                  <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: T.cyan, fontFamily: T.mono }}>{plan.totalSprints}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 9, color: T.t3, fontFamily: T.mono, textTransform: "uppercase" }}>Est. Complete</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, color: T.green, fontFamily: T.mono }}>{plan.projectedCompletion}</p>
                </div>
              </div>
            </div>
          </Card>
          {(plan.sprints || []).map((sprint, si) => (
            <Card key={si} glow glowColor={T.blue}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: T.blue, fontFamily: T.mono }}>SPRINT {sprint.number}</span>
                    <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>
                      {sprint.startDate} → {sprint.endDate}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.t1 }}>{sprint.goal}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.violet, fontFamily: T.mono }}>{sprint.totalPoints}pts</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(sprint.tasks || []).map((task, ti) => {
                  const empIdx = project?.team.findIndex((m) => m.avatar === task.assignee || m.name === task.assignee);
                  return (
                    <div key={ti} style={{ display: "flex", gap: 10, padding: "8px 10px", background: "rgba(255,255,255,0.05)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, alignItems: "center" }}>
                      <Av initials={task.assignee?.substring(0, 2) || "??"} size={24} idx={empIdx >= 0 ? empIdx : ti} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontStyle: "italic" }}>{task.rationale}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.violet, fontFamily: T.mono, background: T.violetGlow, padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{task.points}p</span>
                    </div>
                  );
                })}
              </div>
              {sprint.risks?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.cardBorder}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 9, color: T.amber, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.5 }}>Sprint Risks</p>
                  {sprint.risks.map((r, i) => (
                    <p key={i} style={{ margin: "2px 0", fontSize: 11, color: T.amber }}>
                      ⚠ {r}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
