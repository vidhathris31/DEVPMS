import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { fmt, dLeft } from "../utils/formatters";
import { Card } from "../components/ui/Primitives";
import AiChatPanel from "../components/features/AiChatPanel";

const QUICK = [
  "Which projects have the highest risk right now?",
  "Summarize budget health across all projects",
  "Are any engineers overallocated?",
  "Forecast completion for all active projects",
  "Which project should be top priority this sprint?",
  "Identify technical debt signals and blockers",
];

export default function AiPage() {
  const T = useTheme();
  const { projects, employees } = useData();

  const systemPrompt = `You are a senior IT project management AI analyst. Live project data below. Be concise, data-driven, use bullet points.

PROJECTS:
${projects
  .map(
    (p) => `• ${p.name} [${p.type}] status=${p.status} priority=${p.priority}
  progress=${p.progress}% deadline=${p.deadline} (${dLeft(p.deadline)}d) budget=${fmt(p.budget)} spent=${fmt(p.spent)} (${Math.round((p.spent / p.budget) * 100)}%)
  stack: ${p.stack.join(", ")} | team: ${p.team.map((t) => t.name).join(", ")}
  tasks: ${p.tasks.filter((t) => t.status === "done").length}/${p.tasks.length} done · ${p.tasks.reduce((a, t) => a + (t.status === "done" ? t.points || 0 : 0), 0)}/${p.tasks.reduce((a, t) => a + (t.points || 0), 0)} pts
  open PRs: ${p.prs?.filter((pr) => pr.status === "open").length || 0} | deploys: ${p.deploys?.map((d) => d.env + ":" + d.version).join(",") || "none"}`
  )
  .join("\n")}
ENGINEERS: ${employees.map((e) => `${e.name}(${e.role},workload=${e.workload}%)`).join("; ")}
Max 250 words.`;

  const sidePanel = (
    <Card>
      <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Live Context</p>
      {[
        ["Projects", projects.length],
        ["Active", projects.filter((p) => p.status === "active").length],
        ["Engineers", employees.length],
        ["Budget", fmt(projects.reduce((a, p) => a + p.budget, 0))],
        ["Spent", fmt(projects.reduce((a, p) => a + p.spent, 0))],
        ["Open PRs", projects.reduce((a, p) => a + (p.prs?.filter((pr) => pr.status === "open").length || 0), 0)],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.cardBorder}`, fontSize: 11 }}>
          <span style={{ color: T.t3, fontFamily: T.mono }}>{k}</span>
          <span style={{ fontWeight: 700, color: T.cyan, fontFamily: T.mono }}>{v}</span>
        </div>
      ))}
    </Card>
  );

  return (
    <AiChatPanel
      feature="ai-analyst"
      label="analyst.ai"
      initialMessage={`> sys: AI analyst online · groq\n> context: ${projects.length} projects · ${employees.length} engineers · live data\n\nWhat would you like to analyze?`}
      systemPrompt={systemPrompt}
      quickQueries={QUICK}
      sidePanel={sidePanel}
    />
  );
}
