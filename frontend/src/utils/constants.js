export const STATUS_CFG = {
  active: { label: "Active", color: "#22D3EE", glow: "rgba(34,211,238,0.12)" },
  shipped: { label: "Shipped", color: "#34D399", glow: "rgba(52,211,153,0.12)" },
  paused: { label: "Paused", color: "#FBBF24", glow: "rgba(251,191,36,0.12)" },
};

export const PRIORITY_CFG = {
  critical: { label: "Critical", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  high: { label: "High", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  low: { label: "Low", color: "#475569", bg: "rgba(71,85,105,0.15)" },
};

export const TASK_CFG = {
  todo: { label: "Backlog", color: "#475569", bg: "rgba(71,85,105,0.12)" },
  active: { label: "In Progress", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  done: { label: "Done", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
};

export const TYPE_ICON = {
  Backend: "⬡",
  "Full-Stack": "◈",
  Fintech: "◆",
  Infrastructure: "▲",
  Data: "◎",
  Security: "◉",
  Mobile: "◐",
};

export const AV_COLORS = ["#3B82F6", "#22D3EE", "#A78BFA", "#34D399", "#FBBF24", "#F472B6", "#14B8A6"];
export const ac = (i) => AV_COLORS[i % AV_COLORS.length];

export const NAV = [
  { id: "dashboard", path: "/dashboard", icon: "⊞", label: "Dashboard" },
  { id: "projects", path: "/projects", icon: "◎", label: "Projects" },
  { id: "tasks", path: "/tasks", icon: "✅", label: "Tasks" },
  { id: "employees", path: "/employees", icon: "◉", label: "Engineers" },
  { id: "gantt", path: "/gantt", icon: "📊", label: "Gantt Charts" },
  { id: "timetrack", path: "/timetrack", icon: "⏱️", label: "Time Tracking" },
  { id: "collab", path: "/collaboration", icon: "💬", label: "Collaboration" },
  { id: "files", path: "/files", icon: "📁", label: "Files" },
  { id: "budget", path: "/budget", icon: "💰", label: "Budget" },
  { id: "reports", path: "/reports", icon: "📈", label: "Reports" },
  { id: "analytics", path: "/analytics", icon: "◈", label: "Analytics" },
  { id: "ai", path: "/ai-analyst", icon: "✦", label: "AI Analyst" },
  { id: "codereview", path: "/code-review", icon: "⬡", label: "Code Review" },
  { id: "burndown", path: "/burndown", icon: "◆", label: "Burndown AI" },
  { id: "mood", path: "/team-mood", icon: "◐", label: "Team Mood" },
  { id: "sprintplan", path: "/sprint-planner", icon: "▲", label: "Sprint Planner" },
  { id: "techdebt", path: "/tech-debt", icon: "◉", label: "Tech Debt" },
  { id: "settings", path: "/settings", icon: "⚙", label: "Settings" },
];
