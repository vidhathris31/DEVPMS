import { useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { STATUS_CFG } from "../../utils/constants";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

const PROJECT_TYPES = ["Backend", "Full-Stack", "Fintech", "Infrastructure", "Data", "Security", "Mobile"];

export default function ProjectForm({ initial, error, onSave, onClose }) {
  const T = useTheme();
  const blank = { name: "", repo: "", type: "Backend", status: "active", priority: "high", budget: "", start: "", deadline: "", progress: 0, stack: [], notes: "" };
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          budget: initial.budget?.toString() || "",
          start: initial.start ? new Date(initial.start).toISOString().slice(0, 10) : "",
          deadline: initial.deadline ? new Date(initial.deadline).toISOString().slice(0, 10) : "",
        }
      : blank
  );
  const [stackIn, setStackIn] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isValidBudget = Number(form.budget) > 0;

  const handleSave = () => {
    if (!form.name || !isValidBudget) return;
    onSave({
      ...(initial ? { _id: initial._id } : {}),
      name: form.name,
      repo: form.repo,
      type: form.type,
      status: form.status,
      priority: form.priority,
      start: form.start,
      deadline: form.deadline,
      budget: Number(form.budget),
      spent: initial?.spent || 0,
      progress: Number(form.progress),
      stack: form.stack,
      notes: form.notes,
      team: initial?.team || [],
      tasks: initial?.tasks || [],
      milestones: initial?.milestones || [{ pct: 100, label: "Launch", done: false }],
      velocity: initial?.velocity || [0, 0, 0, 0, 0, 0, 0],
      prs: initial?.prs || [],
      deploys: initial?.deploys || [],
      budgetHistory: initial?.budgetHistory || [],
    });
  };

  return (
    <Modal title={initial ? "Edit Project" : "New Project"} sub={initial ? `id:${initial._id}` : "new project"} onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <FL label="Project Name" required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. NebulaCore" />
        </FL>
        <FL label="Repository">
          <Input value={form.repo} onChange={(e) => set("repo", e.target.value)} placeholder="org/repo-name" />
        </FL>
        <FL label="Type">
          <Select value={form.type} onChange={(e) => set("type", e.target.value)} options={PROJECT_TYPES.map((t) => ({ value: t, label: t }))} />
        </FL>
        <FL label="Priority">
          <Select value={form.priority} onChange={(e) => set("priority", e.target.value)} options={[{ value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "low", label: "Low" }]} />
        </FL>
        <FL label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={Object.entries(STATUS_CFG).map(([v, c]) => ({ value: v, label: c.label }))} />
        </FL>
        <FL label="Start Date" required>
          <Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} />
        </FL>
        <FL label="Deadline" required>
          <Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
        </FL>
        <FL label="Budget (₹)" required>
          <Input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 4200000" />
          {form.budget !== "" && !isValidBudget && <p style={{ margin: "4px 0 0", fontSize: 11, color: T.red, fontFamily: T.mono }}>Budget must be greater than 0</p>}
        </FL>
        <FL label={`Progress: ${form.progress}%`}>
          <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} style={{ width: "100%", accentColor: T.blue, marginTop: 4 }} />
        </FL>
      </div>
      <FL label="Tech Stack">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {form.stack.map((s) => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: T.cyanGlow, border: `1px solid ${T.cyan}28`, borderRadius: 4, fontSize: 11, color: T.cyan, fontFamily: T.mono }}>
              {s}
              <button onClick={() => set("stack", form.stack.filter((x) => x !== s))} style={{ background: "none", border: "none", color: T.cyan, cursor: "pointer", padding: 0, fontSize: 13 }}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Input
            value={stackIn}
            onChange={(e) => setStackIn(e.target.value)}
            placeholder="Add tech (Enter)"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && stackIn.trim()) {
                set("stack", [...form.stack, stackIn.trim()]);
                setStackIn("");
              }
            }}
          />
          <Btn
            onClick={() => {
              if (stackIn.trim()) {
                set("stack", [...form.stack, stackIn.trim()]);
                setStackIn("");
              }
            }}
            variant="ghost"
          >
            Add
          </Btn>
        </div>
      </FL>
      <FL label="Notes">
        <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </FL>
      {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={handleSave} disabled={!form.name || !isValidBudget}>
          {initial ? "Update" : "Create"} Project
        </Btn>
      </div>
    </Modal>
  );
}
