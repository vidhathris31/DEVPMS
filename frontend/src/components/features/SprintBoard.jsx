import { useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { TASK_CFG } from "../../utils/constants";
import { fmtD } from "../../utils/formatters";
import { Btn, Av } from "../ui/Primitives";

export default function SprintBoard({ tasks, team, onMove, onAdd, onEdit, highlightTaskId }) {
  const T = useTheme();
  const [drag, setDrag] = useState(null);
  const [hovCol, setHovCol] = useState(null);
  const cols = ["todo", "active", "done"];
  const totalPts = tasks.reduce((a, t) => a + (t.points || 0), 0);
  const donePts = tasks.filter((t) => t.status === "done").reduce((a, t) => a + (t.points || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Sprint Board</span>
          <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>
            {donePts}/{totalPts} pts
          </span>
          <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${totalPts ? (donePts / totalPts) * 100 : 0}%`, background: T.cyan, borderRadius: 2, boxShadow: `0 0 6px ${T.cyan}` }} />
          </div>
        </div>
        <Btn small variant="ghost" onClick={onAdd} icon="+">
          Task
        </Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {cols.map((col) => {
          const cfg = TASK_CFG[col],
            colTasks = tasks.filter((t) => t.status === col);
          const colPts = colTasks.reduce((a, t) => a + (t.points || 0), 0);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setHovCol(col);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (drag) onMove(drag, col);
                setHovCol(null);
              }}
              onDragLeave={() => setHovCol(null)}
              style={{
                background: hovCol === col ? cfg.bg : "rgba(255,255,255,0.015)",
                border: `1px dashed ${hovCol === col ? cfg.color : T.cardBorder}`,
                borderRadius: 10, padding: 10, minHeight: 180, transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block", boxShadow: `0 0 5px ${cfg.color}` }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color, textTransform: "uppercase", letterSpacing: 0.6, fontFamily: T.mono }}>{cfg.label}</span>
                </div>
                <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{colPts}pts</span>
              </div>
              {colTasks.map((task, ti) => {
                const taskId = task._id || task.id;
                const ei = team.findIndex((m) => m.avatar === task.assignee);
                const isHighlighted = highlightTaskId && String(taskId) === String(highlightTaskId);
                return (
                  <div
                    key={taskId}
                    draggable
                    onDragStart={() => setDrag(taskId)}
                    onDragEnd={() => setDrag(null)}
                    style={{
                      position: "relative",
                      background: drag === taskId ? "rgba(59,130,246,0.08)" : T.card,
                      border: `1px solid ${isHighlighted ? T.cyan : drag === taskId ? T.blue : T.cardBorder}`,
                      borderRadius: 8, padding: "9px 10px", marginBottom: 6, cursor: "grab",
                      opacity: drag === taskId ? 0.4 : 1, transition: "all 0.12s",
                      boxShadow: isHighlighted ? `0 0 0 1px ${T.cyan}, 0 0 16px ${T.cyan}50` : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F0F6FF", lineHeight: 1.4 }}>{task.title}</p>
                      {onEdit && (
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                          }}
                          draggable={false}
                          title="Edit task"
                          style={{ background: "none", border: "none", cursor: "pointer", color: T.t3, fontSize: 11, padding: "2px 4px", flexShrink: 0, lineHeight: 1 }}
                        >
                          ✎
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Av initials={task.assignee} size={18} idx={ei >= 0 ? ei : ti} />
                        <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{task.assignee}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {task.points && (
                          <span style={{ fontSize: 10, color: T.violet, fontFamily: T.mono, background: T.violetGlow, padding: "1px 5px", borderRadius: 3 }}>{task.points}p</span>
                        )}
                        {task.due && <span style={{ fontSize: 9, color: T.t3, fontFamily: T.mono }}>{fmtD(task.due).split(" ").slice(0, 2).join(" ")}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
