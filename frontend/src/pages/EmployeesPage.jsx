import { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { apiErrorMessage } from "../services/api";
import { fmtD } from "../utils/formatters";
import { ac } from "../utils/constants";
import { Card, Av, Tag, StackTag, Prg, Btn } from "../components/ui/Primitives";
import EmployeeForm from "../components/features/EmployeeForm";

export default function EmployeesPage() {
  const T = useTheme();
  const { employees, projects, saveEmployee, deleteEmployee } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [addModal, setAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");

  const visible = employees.filter((e) => (filter === "all" || e.status === filter) && (!search || e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase())));
  const empProjects = (empId) => projects.filter((p) => p.team.some((m) => String(m.employee) === String(empId)));

  const handleSave = async (payload) => {
    setFormError("");
    try {
      await saveEmployee(payload);
      setAddModal(false);
      setEditTarget(null);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this engineer from the roster?")) return;
    setListError("");
    try {
      await deleteEmployee(id);
    } catch (err) {
      setListError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      {(addModal || editTarget) && (
        <EmployeeForm
          initial={editTarget}
          error={formError}
          onSave={handleSave}
          onClose={() => {
            setAddModal(false);
            setEditTarget(null);
            setFormError("");
          }}
        />
      )}

      {listError && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: `1px solid ${T.red}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: T.red, fontSize: 12, fontFamily: T.mono }}>
          {listError}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.06)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: 3 }}>
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === f ? T.blue : "transparent", color: filter === f ? "#fff" : T.t3, fontWeight: filter === f ? 700 : 400, fontSize: 11, cursor: "pointer", fontFamily: T.mono, textTransform: "capitalize" }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search engineers…"
            style={{ border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, outline: "none", width: 220, background: T.bg2, color: T.t1, fontFamily: T.mono }}
          />
          <Btn onClick={() => setAddModal(true)} icon="+">
            Engineer
          </Btn>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
        {visible.map((emp, i) => {
          const eps = empProjects(emp._id),
            wl = emp.workload;
          const wlCol = wl >= 85 ? T.red : wl >= 70 ? T.amber : wl >= 50 ? T.cyan : T.green;
          return (
            <Card key={emp._id} glow glowColor={ac(i)}>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <Av initials={emp.avatar} size={48} idx={i} ring />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: T.t1 }}>{emp.name}</p>
                  <p style={{ margin: "2px 0", fontSize: 12, color: T.t3, fontFamily: T.mono }}>{emp.role}</p>
                  <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                    <Tag label={emp.status === "active" ? "Active" : "Inactive"} color={emp.status === "active" ? T.green : T.t3} bg={emp.status === "active" ? T.greenGlow : "rgba(71,85,105,0.15)"} dot />
                    <Tag label={emp.dept} color={T.violet} bg={T.violetGlow} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>workload</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: wlCol, fontFamily: T.mono }}>{wl}%</span>
                </div>
                <Prg value={wl} color={wlCol} h={5} />
              </div>
              <div style={{ fontSize: 11, color: T.t3, fontFamily: T.mono, marginBottom: 12 }}>
                {[["Joined", fmtD(emp.joined)], ["Projects", eps.length], ["Email", emp.email]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                    <span>{k}</span>
                    <span style={{ fontWeight: 600, color: T.t2 }}>{v}</span>
                  </div>
                ))}
              </div>
              {emp.skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {emp.skills.map((s) => (
                    <StackTag key={s} label={s} />
                  ))}
                </div>
              )}
              {eps.length > 0 && (
                <div style={{ borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10, marginBottom: 10 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: T.mono }}>Active Projects</p>
                  {eps.slice(0, 2).map((p) => (
                    <div key={p._id} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: T.t2, fontFamily: T.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{p.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>{p.progress}%</span>
                      </div>
                      <Prg value={p.progress} h={3} />
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, borderTop: `1px solid ${T.cardBorder}`, paddingTop: 10 }}>
                <Btn small variant="secondary" onClick={() => setEditTarget(emp)}>
                  Edit
                </Btn>
                <Btn small variant="danger" onClick={() => handleDelete(emp._id)}>
                  Remove
                </Btn>
              </div>
            </Card>
          );
        })}
        {visible.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: T.t3 }}>
            <p style={{ fontSize: 24, margin: "0 0 8px", color: T.blue }}>◉</p>
            <p style={{ margin: 0, fontSize: 12, fontFamily: T.mono }}>
              {employees.length === 0 ? "No engineers on the roster yet — add one to get started." : `No ${filter} engineers${search ? ` matching "${search}"` : ""}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
