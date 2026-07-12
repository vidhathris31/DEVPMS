import { useState } from "react";
import { PRIORITY_CFG, TASK_CFG } from "../../utils/constants";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

export default function EditTaskModal({ task, team, error, onSave, onClose }) {
  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [assignee, setAssignee] = useState(task.assignee || team[0]?.avatar || "");
  const [due, setDue] = useState(task.due ? new Date(task.due).toISOString().slice(0, 10) : "");
  const [pts, setPts] = useState(String(task.points || 1));
  const [status, setStatus] = useState(task.status || "todo");
  const [priority, setPriority] = useState(task.priority || "high");

  return (
    <Modal title="Edit Task" sub={`id:${task._id}`} onClose={onClose}>
      <FL label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
      </FL>
      <FL label="Description">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional details about this task" />
      </FL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Assignee">
          {team.length > 0 ? (
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} options={team.map((m) => ({ value: m.avatar, label: m.name }))} />
          ) : (
            <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Initials, e.g. AM" />
          )}
        </FL>
        <FL label="Story Points">
          <Select value={pts} onChange={(e) => setPts(e.target.value)} options={[1, 2, 3, 5, 8, 13, 21].map((n) => ({ value: String(n), label: `${n} pts` }))} />
        </FL>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={Object.entries(TASK_CFG).map(([v, c]) => ({ value: v, label: c.label }))} />
        </FL>
        <FL label="Priority">
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} options={Object.entries(PRIORITY_CFG).map(([v, c]) => ({ value: v, label: c.label }))} />
        </FL>
      </div>
      <FL label="Due Date">
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </FL>
      {error && <p style={{ color: "#F87171", fontSize: 12, fontFamily: "monospace", margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          onClick={() => {
            if (title) onSave({ title, description, assignee, due: due || null, points: Number(pts), status, priority });
          }}
          disabled={!title}
        >
          Save Changes
        </Btn>
      </div>
    </Modal>
  );
}
