import { useState } from "react";
import { Modal, FL, Input, Select, Btn } from "../ui/Primitives";

export default function EmployeeForm({ initial, error, onSave, onClose }) {
  const blank = { name: "", role: "", dept: "", email: "", joined: new Date().toISOString().slice(0, 10), workload: "50", status: "active", skills: [] };
  const [form, setForm] = useState(
    initial
      ? { ...initial, joined: initial.joined ? new Date(initial.joined).toISOString().slice(0, 10) : "", workload: String(initial.workload ?? 50) }
      : blank
  );
  const [skillIn, setSkillIn] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const initials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const handleSave = () => {
    if (!form.name || !form.role || !form.email) return;
    onSave({
      ...(initial ? { _id: initial._id } : {}),
      name: form.name,
      role: form.role,
      dept: form.dept || "Engineering",
      email: form.email,
      joined: form.joined,
      workload: Number(form.workload),
      status: form.status,
      skills: form.skills,
      avatar: initials(form.name),
    });
  };

  return (
    <Modal title={initial ? "Edit Engineer" : "New Engineer"} onClose={onClose}>
      <FL label="Full Name" required>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ananya Sharma" />
      </FL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Role / Title" required>
          <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Backend Engineer" />
        </FL>
        <FL label="Department">
          <Input value={form.dept} onChange={(e) => set("dept", e.target.value)} placeholder="e.g. Engineering" />
        </FL>
      </div>
      <FL label="Email" required>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="e.g. ananya@company.com" />
      </FL>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <FL label="Joined Date">
          <Input type="date" value={form.joined} onChange={(e) => set("joined", e.target.value)} />
        </FL>
        <FL label="Status">
          <Select value={form.status} onChange={(e) => set("status", e.target.value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
        </FL>
      </div>
      <FL label={`Workload: ${form.workload}%`}>
        <input type="range" min={0} max={100} value={form.workload} onChange={(e) => set("workload", e.target.value)} style={{ width: "100%", marginTop: 4 }} />
      </FL>
      <FL label="Skills">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {form.skills.map((s) => (
            <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "rgba(52,212,240,0.15)", border: "1px solid rgba(52,212,240,0.3)", borderRadius: 4, fontSize: 11, color: "#34D4F0" }}>
              {s}
              <button onClick={() => set("skills", form.skills.filter((x) => x !== s))} style={{ background: "none", border: "none", color: "#34D4F0", cursor: "pointer", padding: 0, fontSize: 13 }}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Input
            value={skillIn} onChange={(e) => setSkillIn(e.target.value)} placeholder="Add skill (Enter)" style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && skillIn.trim()) {
                set("skills", [...form.skills, skillIn.trim()]);
                setSkillIn("");
              }
            }}
          />
          <Btn
            variant="ghost"
            onClick={() => {
              if (skillIn.trim()) {
                set("skills", [...form.skills, skillIn.trim()]);
                setSkillIn("");
              }
            }}
          >
            Add
          </Btn>
        </div>
      </FL>
      {error && <p style={{ color: "#F87171", fontSize: 12, fontFamily: "monospace", margin: "0 0 12px" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={handleSave} disabled={!form.name || !form.role || !form.email}>
          {initial ? "Update" : "Add"} Engineer
        </Btn>
      </div>
    </Modal>
  );
}
