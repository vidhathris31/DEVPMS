import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { apiErrorMessage } from "../services/api";
import { fmt, fmtD, dLeft } from "../utils/formatters";
import { STATUS_CFG, PRIORITY_CFG, TYPE_ICON } from "../utils/constants";
import { Card, Tag, StackTag, Prg, Ring, VelocityChart, BarChart, StatCard, Av, Pipeline, PRList } from "../components/ui/Primitives";
import SprintBoard from "../components/features/SprintBoard";
import TaskModal from "../components/features/TaskModal";
import EditTaskModal from "../components/features/EditTaskModal";

const TABS = ["overview", "sprint", "deploys", "prs", "budget", "milestones", "team"];

export default function ProjectDetail() {
  const T = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { projects, employees, updateProjectTasks, editTask } = useData();
  const [tab, setTab] = useState(location.state?.tab && TABS.includes(location.state.tab) ? location.state.tab : "overview");
  const [showTask, setShowTask] = useState(false);
  const [editTaskTarget, setEditTaskTarget] = useState(null);
  const [error, setError] = useState("");
  const [highlightTaskId] = useState(location.state?.highlightTaskId || null);

  const project = projects.find((p) => p._id === id);

  if (!project) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: T.t3 }}>
        <p style={{ fontFamily: T.mono, fontSize: 12 }}>Project not found.</p>
        <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontFamily: T.mono }}>
          ← back to projects
        </button>
      </div>
    );
  }

  const d = dLeft(project.deadline);
  const done = project.tasks.filter((t) => t.status === "done").length;
  const spentPct = Math.round((project.spent / (project.budget || 1)) * 100);
  const scfg = STATUS_CFG[project.status];
  const openPRs = project.prs?.filter((pr) => pr.status === "open") || [];

  const addTask = async (task) => {
    setError("");
    try {
      await updateProjectTasks(project._id, { ...project, tasks: [...project.tasks, task] });
      setShowTask(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };
  const moveTask = async (tid, ns) => {
    setError("");
    try {
      await updateProjectTasks(project._id, { ...project, tasks: project.tasks.map((t) => (t._id === tid ? { ...t, status: ns } : t)) });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };
  const saveTaskEdit = async (patch) => {
    setError("");
    try {
      await editTask(project._id, editTaskTarget._id, patch);
      setEditTaskTarget(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      {showTask && (
        <TaskModal
          team={project.team}
          error={error}
          onSave={addTask}
          onClose={() => {
            setShowTask(false);
            setError("");
          }}
        />
      )}
      {editTaskTarget && (
        <EditTaskModal
          task={editTaskTarget}
          team={project.team}
          error={error}
          onSave={saveTaskEdit}
          onClose={() => {
            setEditTaskTarget(null);
            setError("");
          }}
        />
      )}
      <button
        onClick={() => navigate("/projects")}
        style={{ background: "none", border: "none", cursor: "pointer", color: T.blue, fontSize: 11, fontWeight: 700, marginBottom: 18, padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: T.mono, letterSpacing: 0.3 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = T.cyan)}
        onMouseLeave={(e) => (e.currentTarget.style.color = T.blue)}
      >
        ← /projects
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 20, color: T.cyan, filter: `drop-shadow(0 0 8px ${T.cyan}60)` }}>{TYPE_ICON[project.type] || "◎"}</span>
            <h2 style={{ margin: 0, fontSize: 23, fontWeight: 900, color: T.t1, letterSpacing: -0.6 }}>{project.name}</h2>
            <Tag label={scfg?.label} color={scfg?.color} bg={scfg?.glow} dot />
            {openPRs.length > 0 && <Tag label={`${openPRs.length} open PR${openPRs.length > 1 ? "s" : ""}`} color={T.blue} bg={T.blueGlow} />}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: T.t3, fontFamily: T.mono }}>
            ⬡ {project.repo} · started {fmtD(project.start)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Tag label={PRIORITY_CFG[project.priority].label} color={PRIORITY_CFG[project.priority].color} bg={PRIORITY_CFG[project.priority].bg} />
          {project.stack.slice(0, 3).map((s) => (
            <StackTag key={s} label={s} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 20px", flex: "0 0 auto" }}>
          <Ring value={project.progress} size={80} color={project.progress >= 75 ? T.green : T.blue} thickness={5} />
          <div>
            <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.6 }}>Completion</p>
            <p style={{ margin: "4px 0 2px", fontSize: 22, fontWeight: 900, color: T.t1, fontFamily: T.mono }}>{project.progress}%</p>
            <p style={{ margin: 0, fontSize: 10, color: T.t3, fontFamily: T.mono }}>
              {done}/{project.tasks.length} tasks · {project.tasks.reduce((a, t) => a + (t.status === "done" ? t.points || 0 : 0), 0)}/{project.tasks.reduce((a, t) => a + (t.points || 0), 0)} pts
            </p>
          </div>
        </Card>
        <StatCard label="Budget" value={fmt(project.budget)} sub={`${fmt(project.spent)} spent · ${spentPct}%`} icon="◆" color={spentPct > 85 ? T.red : T.green} />
        <StatCard label={d > 0 ? "Days Left" : "Overdue"} value={Math.abs(d)} sub={`Due ${fmtD(project.deadline)}`} icon={d > 0 ? "◎" : "◈"} color={d > 0 ? T.cyan : T.red} />
        <StatCard label="Team" value={project.team.length} sub={`${project.deploys?.length || 0} environments`} icon="◉" color={T.violet} />
      </div>

      {project.velocity && (
        <Card style={{ marginBottom: 18, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Sprint Velocity</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>
                avg {Math.round(project.velocity.reduce((a, b) => a + b, 0) / project.velocity.length)} pts/sprint · current <span style={{ color: T.cyan }}>{project.velocity[project.velocity.length - 1]} pts</span>
              </p>
            </div>
            <VelocityChart data={project.velocity} height={50} width={190} />
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 18, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{ background: "none", border: "none", borderBottom: `2px solid ${tab === t ? T.blue : "transparent"}`, color: tab === t ? T.blue : T.t3, fontWeight: tab === t ? 700 : 400, fontSize: 11, padding: "8px 14px", cursor: "pointer", marginBottom: -1, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: T.mono, transition: "all 0.12s", whiteSpace: "nowrap" }}
          >
            {t}
            {t === "prs" && openPRs.length > 0 && <span style={{ marginLeft: 4, background: T.red, color: "#fff", borderRadius: 8, fontSize: 9, padding: "1px 4px" }}>{openPRs.length}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Project Info</p>
            {[["Repository", `⬡ ${project.repo}`], ["Start", fmtD(project.start)], ["Deadline", fmtD(project.deadline)], ["Type", project.type], ["Budget", fmt(project.budget)], ["Spent", `${fmt(project.spent)} (${spentPct}%)`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 11, color: T.t3, fontFamily: T.mono }}>{k}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.t2, fontFamily: T.mono, textAlign: "right", maxWidth: 200 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.6 }}>Stack</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {project.stack.map((s) => (
                  <StackTag key={s} label={s} />
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Notes</p>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: T.t2, lineHeight: 1.7 }}>{project.notes || "No notes."}</p>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: T.t3, fontFamily: T.mono, textTransform: "uppercase", letterSpacing: 0.6 }}>Monthly Spend (₹)</p>
            <BarChart data={project.budgetHistory} color={T.blue} height={70} width={240} />
          </Card>
        </div>
      )}

      {tab === "sprint" && (
        <Card>
          {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "0 0 12px" }}>{error}</p>}
          <SprintBoard tasks={project.tasks} team={project.team} onMove={moveTask} onAdd={() => setShowTask(true)} onEdit={setEditTaskTarget} highlightTaskId={highlightTaskId} />
        </Card>
      )}
      {tab === "deploys" && (
        <Card>
          <p style={{ margin: "0 0 18px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Deployment Pipeline</p>
          <Pipeline deploys={project.deploys} />
        </Card>
      )}
      {tab === "prs" && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Pull Requests</p>
          <PRList prs={project.prs} />
        </Card>
      )}

      {tab === "budget" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Budget Breakdown</p>
            {[["Total Budget", fmt(project.budget), T.t2], ["Spent", fmt(project.spent), spentPct > 85 ? T.red : T.amber], ["Remaining", fmt(project.budget - project.spent), T.green]].map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>{k}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: T.mono }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>burn rate</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: spentPct > 85 ? T.red : spentPct > 65 ? T.amber : T.green, fontFamily: T.mono }}>{spentPct}%</span>
              </div>
              <Prg value={spentPct} color={spentPct > 85 ? T.red : spentPct > 65 ? T.amber : T.blue} h={8} />
            </div>
          </Card>
          <Card>
            <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Monthly Spend</p>
            <BarChart data={project.budgetHistory} color={T.blue} height={100} width={260} />
            {project.budgetHistory.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 10, color: T.t3, fontFamily: T.mono }}>
                <span>avg {fmt(project.budgetHistory.reduce((a, b) => a + b.v, 0) / project.budgetHistory.length)}</span>
                <span>peak {fmt(Math.max(...project.budgetHistory.map((b) => b.v)))}</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "milestones" && (
        <Card>
          <p style={{ margin: "0 0 18px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Milestones</p>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 1, background: `linear-gradient(to bottom,${T.blue},rgba(59,130,246,0.1))` }} />
            {project.milestones.map((m, i) => {
              const reached = m.done || project.progress >= m.pct;
              const col = m.done ? T.green : reached ? T.amber : T.t4;
              return (
                <div key={i} style={{ position: "relative", marginBottom: 16 }}>
                  <div
                    style={{
                      position: "absolute", left: -32, top: 4, width: 18, height: 18, borderRadius: "50%",
                      background: m.done ? T.green + "18" : reached ? T.amber + "18" : T.bg,
                      border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 1, boxShadow: m.done ? `0 0 10px ${T.green}50` : reached ? `0 0 8px ${T.amber}40` : "none",
                    }}
                  >
                    {m.done && <span style={{ fontSize: 9, color: T.green, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ background: m.done ? T.greenGlow : reached ? T.amberGlow : "rgba(255,255,255,0.02)", border: `1px solid ${m.done ? T.green + "30" : reached ? T.amber + "30" : T.cardBorder}`, borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.t1 }}>{m.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.t2, fontFamily: T.mono }}>{m.pct}%</span>
                        <Tag label={m.done ? "Done" : reached ? "Reached" : "Pending"} color={col} bg={col + "18"} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "team" && (
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Team</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 10 }}>
            {project.team.map((m, i) => {
              const emp = employees.find((e) => String(e._id) === String(m.employee));
              const wl = emp?.workload || 0;
              return (
                <div key={i} style={{ display: "flex", gap: 12, padding: 12, background: "rgba(255,255,255,0.05)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10 }}>
                  <Av initials={m.avatar} size={44} idx={i} ring />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1 }}>{m.name}</p>
                    <p style={{ margin: "2px 0", fontSize: 12, color: T.t3, fontFamily: T.mono }}>{m.role}</p>
                    {emp && (
                      <>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                          {emp.skills.slice(0, 2).map((s) => (
                            <StackTag key={s} label={s} />
                          ))}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: T.t3, fontFamily: T.mono }}>workload</span>
                            <span style={{ fontSize: 9, color: wl >= 85 ? T.red : wl >= 70 ? T.amber : T.green, fontFamily: T.mono }}>{wl}%</span>
                          </div>
                          <Prg value={wl} color={wl >= 85 ? T.red : wl >= 70 ? T.amber : T.green} h={3} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
