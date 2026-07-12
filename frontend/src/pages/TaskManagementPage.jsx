import { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { apiErrorMessage } from "../services/api";
import { fmtD, dLeft } from "../utils/formatters";
import { TASK_CFG } from "../utils/constants";
import { Card, StatCard, Select, Tag, Av, Btn } from "../components/ui/Primitives";
import NewTaskModal from "../components/features/NewTaskModal";
import EditTaskModal from "../components/features/EditTaskModal";

export default function TaskManagementPage() {
  const T = useTheme();
  const { projects, employees, updateProjectTasks, editTask } = useData();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("due");
  const [showNewTask, setShowNewTask] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState("");

  const allTasks = projects.flatMap((p) => p.tasks.map((t) => ({ ...t, projectName: p.name, projectId: p._id })));
  const filtered = allTasks
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.projectName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sortBy === "due" ? new Date(a.due || "2099") - new Date(b.due || "2099") : sortBy === "points" ? b.points - a.points : a.title.localeCompare(b.title)));

  const totalPts = allTasks.reduce((a, t) => a + (t.points || 0), 0) || 1;
  const donePts = allTasks.filter((t) => t.status === "done").reduce((a, t) => a + (t.points || 0), 0);
  const activePts = allTasks.filter((t) => t.status === "active").reduce((a, t) => a + (t.points || 0), 0);

  const addTask = async (projectId, task) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return;
    setError("");
    try {
      await updateProjectTasks(projectId, { ...project, tasks: [...project.tasks, task] });
      setShowNewTask(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const saveTaskEdit = async (patch) => {
    setError("");
    try {
      await editTask(editTarget.projectId, editTarget._id, patch);
      setEditTarget(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {showNewTask && (
        <NewTaskModal
          projects={projects}
          error={error}
          onSave={addTask}
          onClose={() => {
            setShowNewTask(false);
            setError("");
          }}
        />
      )}

      {editTarget && (
        <EditTaskModal
          task={editTarget}
          team={projects.find((p) => p._id === editTarget.projectId)?.team || []}
          error={error}
          onSave={saveTaskEdit}
          onClose={() => {
            setEditTarget(null);
            setError("");
          }}
        />
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total Tasks" value={allTasks.length} icon="✅" color={T.blue} sub={`${donePts}/${totalPts} story pts`} />
        <StatCard label="Done" value={allTasks.filter((t) => t.status === "done").length} icon="◆" color={T.green} sub={`${Math.round((donePts / totalPts) * 100)}% of points`} />
        <StatCard label="In Progress" value={allTasks.filter((t) => t.status === "active").length} icon="◈" color={T.amber} sub={`${activePts} pts in flight`} />
        <StatCard label="Backlog" value={allTasks.filter((t) => t.status === "todo").length} icon="◎" color={T.violet} sub="not started" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: 3 }}>
          {[["all", "All"], ["todo", "Backlog"], ["active", "In Progress"], ["done", "Done"]].map(([v, l]) => (
            <button
              key={v} onClick={() => setFilter(v)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === v ? T.blue : "transparent", color: filter === v ? "#fff" : T.t2, fontWeight: filter === v ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: T.mono, transition: "all 0.12s" }}
            >
              {l} ({allTasks.filter((t) => v === "all" || t.status === v).length})
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.t3, fontSize: 13 }}>⌕</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…"
              style={{ border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "7px 12px 7px 28px", fontSize: 12, outline: "none", width: 200, background: T.bg2, color: T.t1, fontFamily: T.mono }}
            />
          </div>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 140, fontSize: 12 }} options={[{ value: "due", label: "Sort: Due Date" }, { value: "points", label: "Sort: Points" }, { value: "title", label: "Sort: Title" }]} />
          <Btn onClick={() => setShowNewTask(true)} disabled={projects.length === 0} icon="+">
            New Task
          </Btn>
        </div>
      </div>

      {projects.length === 0 && (
        <Card style={{ textAlign: "center", padding: "24px" }}>
          <p style={{ margin: 0, fontSize: 12, color: T.t3, fontFamily: T.mono }}>Create a project first — tasks live inside a project.</p>
        </Card>
      )}

      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              {["Task", "Project", "Assignee", "Status", "Points", "Due Date", ""].map((h) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.t2, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `2px solid ${T.cardBorder}`, fontFamily: T.mono }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const cfg = TASK_CFG[t.status];
              const empIdx = employees.findIndex((e) => e.avatar === t.assignee);
              return (
                <tr
                  key={`${t._id}_${t.projectId}`} style={{ borderBottom: `1px solid ${T.cardBorder}`, transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = T.blueGlow)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1 }}>{t.title}</p>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, color: T.cyan, fontFamily: T.mono }}>{t.projectName}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Av initials={t.assignee} size={24} idx={empIdx >= 0 ? empIdx : i} />
                      <span style={{ fontSize: 11, color: T.t2, fontFamily: T.mono }}>{t.assignee}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Tag label={cfg?.label} color={cfg?.color} bg={cfg?.bg} />
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.violet, fontFamily: T.mono, background: T.violetGlow, padding: "2px 8px", borderRadius: 4 }}>{t.points || 3}p</span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: t.due && dLeft(t.due) < 0 ? T.red : t.due && dLeft(t.due) < 7 ? T.amber : T.t2, fontFamily: T.mono, fontWeight: 600 }}>{t.due ? fmtD(t.due) : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Btn small variant="secondary" onClick={() => setEditTarget(t)}>
                      Edit
                    </Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.t3 }}>
            <p style={{ fontSize: 24, margin: "0 0 8px", color: T.blue }}>✅</p>
            <p style={{ margin: 0, fontSize: 12, fontFamily: T.mono }}>
              {allTasks.length === 0 ? "No tasks yet." : `No tasks matching your filters${search ? ` for "${search}"` : ""}.`}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
