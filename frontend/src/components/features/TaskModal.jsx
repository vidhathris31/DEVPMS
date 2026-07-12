import { useState } from "react";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

export default function TaskModal({ team, error, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(team[0]?.avatar || "");
  const [due, setDue] = useState("");
  const [pts, setPts] = useState("5");

  return (
    <Modal title="New Task" onClose={onClose}>
      <FL label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement OAuth2 PKCE flow" />
      </FL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Assignee">
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} options={team.map((m) => ({ value: m.avatar, label: m.name }))} />
        </FL>
        <FL label="Story Points">
          <Select value={pts} onChange={(e) => setPts(e.target.value)} options={[1, 2, 3, 5, 8, 13, 21].map((n) => ({ value: String(n), label: `${n} pts` }))} />
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
            if (title) onSave({ title, assignee, due, status: "todo", points: Number(pts) });
          }}
          disabled={!title}
        >
          Add Task
        </Btn>
      </div>
    </Modal>
  );
}
