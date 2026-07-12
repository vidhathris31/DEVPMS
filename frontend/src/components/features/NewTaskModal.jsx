import { useState } from "react";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

export default function NewTaskModal({ projects, defaultProjectId, error, onSave, onClose }) {
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?._id || "");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [due, setDue] = useState("");
  const [pts, setPts] = useState("5");

  const project = projects.find((p) => p._id === projectId);
  const team = project?.team || [];
  const [assignee, setAssignee] = useState(team[0]?.avatar || "");

  const handleProjectChange = (id) => {
    setProjectId(id);
    const p = projects.find((pr) => pr._id === id);
    setAssignee(p?.team?.[0]?.avatar || "");
  };

  return (
    <Modal title="New Task" sub="Tasks belong to a project — pick one first" onClose={onClose}>
      <FL label="Project" required>
        <Select value={projectId} onChange={(e) => handleProjectChange(e.target.value)} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
      </FL>
      <FL label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement OAuth2 PKCE flow" />
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
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "todo", label: "Backlog" }, { value: "active", label: "In Progress" }, { value: "done", label: "Done" }]} />
        </FL>
        <FL label="Due Date">
          <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </FL>
      </div>
      {error && <p style={{ color: "#F87171", fontSize: 12, fontFamily: "monospace", margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          onClick={() => {
            if (title && projectId) onSave(projectId, { title, assignee, due, status, points: Number(pts) });
          }}
          disabled={!title || !projectId}
        >
          Add Task
        </Btn>
      </div>
    </Modal>
  );
}
