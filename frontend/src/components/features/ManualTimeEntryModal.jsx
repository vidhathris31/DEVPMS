import { useState } from "react";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

export default function ManualTimeEntryModal({ projects, error, onSave, onClose }) {
  const [project, setProject] = useState(projects[0]?._id || "");
  const [task, setTask] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("");
  const [billable, setBillable] = useState(true);

  return (
    <Modal title="Log Time Manually" sub="Add a past time entry without using the timer" onClose={onClose}>
      <FL label="Project" required>
        <Select value={project} onChange={(e) => setProject(e.target.value)} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
      </FL>
      <FL label="Task" required>
        <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="What did you work on?" />
      </FL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Date" required>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FL>
        <FL label="Hours" required>
          <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 2.5" />
        </FL>
      </div>
      <FL label="Billable">
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} />
          <span style={{ fontSize: 12 }}>Count this entry as billable</span>
        </label>
      </FL>
      {error && <p style={{ color: "#F87171", fontSize: 12, fontFamily: "monospace", margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn
          onClick={() => {
            if (project && task && hours) onSave({ project, task, date, hours: Number(hours), billable });
          }}
          disabled={!project || !task || !hours}
        >
          Log Entry
        </Btn>
      </div>
    </Modal>
  );
}
