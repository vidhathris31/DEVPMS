import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { apiErrorMessage } from "../services/api";
import { fmt, fmtD, dLeft } from "../utils/formatters";
import { STATUS_CFG, PRIORITY_CFG, TYPE_ICON } from "../utils/constants";
import { Card, Tag, StackTag, Prg, Btn, Select, Av } from "../components/ui/Primitives";
import ProjectForm from "../components/features/ProjectForm";

export default function ProjectsPage() {
  const T = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, saveProject, deleteProject } = useData();

  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("deadline");
  const [view, setView] = useState("grid");
  const [addModal, setAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const visible = projects
    .filter((p) => p.status === filter)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.stack?.join(" ").toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === "deadline" ? new Date(a.deadline) - new Date(b.deadline) : sort === "progress" ? b.progress - a.progress : sort === "budget" ? b.budget - a.budget : a.name.localeCompare(b.name)));

  const handleSave = async (payload) => {
    setFormError("");
    try {
      await saveProject(payload);
      setAddModal(false);
      setEditTarget(null);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setListError("");
    try {
      await deleteProject(id);
    } catch (err) {
      setListError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      {(addModal || editTarget) && (
        <ProjectForm
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
          {Object.entries(STATUS_CFG).map(([s, cfg]) => (
            <button
              key={s} onClick={() => setFilter(s)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === s ? T.blue : "transparent", color: filter === s ? "#fff" : T.t3, fontWeight: filter === s ? 700 : 400, fontSize: 11, cursor: "pointer", fontFamily: T.mono, transition: "all 0.12s" }}
            >
              {cfg.label} ({projects.filter((p) => p.status === s).length})
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.t3, fontSize: 12, fontFamily: T.mono }}>⌕</span>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              style={{ border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "7px 12px 7px 28px", fontSize: 12, outline: "none", width: 190, background: T.bg2, color: T.t1, fontFamily: T.mono }}
            />
          </div>
          <Select
            value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 130, padding: "7px 10px", fontSize: 12 }}
            options={[{ value: "deadline", label: "↕ Deadline" }, { value: "progress", label: "↕ Progress" }, { value: "budget", label: "↕ Budget" }, { value: "name", label: "↕ Name" }]}
          />
          <div style={{ display: "flex", border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, overflow: "hidden" }}>
            {["grid", "list"].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "7px 10px", background: view === v ? T.blueGlow : "transparent", border: "none", cursor: "pointer", fontSize: 12, color: view === v ? T.blue : T.t3, transition: "all 0.12s" }}>
                {v === "grid" ? "⊞" : "☰"}
              </button>
            ))}
          </div>
          <Btn onClick={() => setAddModal(true)} icon="+">
            Project
          </Btn>
        </div>
      </div>

      {view === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 14 }}>
          {visible.map((p) => {
            const scfg = STATUS_CFG[p.status],
              pcfg = PRIORITY_CFG[p.priority],
              d = dLeft(p.deadline);
            const openPRs = p.prs?.filter((pr) => pr.status === "open").length || 0;
            return (
              <Card key={p._id} onClick={() => navigate(`/projects/${p._id}`)} glow>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 17, color: T.cyan, filter: `drop-shadow(0 0 6px ${T.cyan}80)` }}>{TYPE_ICON[p.type] || "◎"}</span>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: -0.3 }}>{p.name}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: T.t3, fontFamily: T.mono }}>⬡ {p.repo}</p>
                  </div>
                  <Tag label={scfg?.label} color={scfg?.color} bg={scfg?.glow} dot />
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                  {p.stack.slice(0, 3).map((s) => (
                    <StackTag key={s} label={s} />
                  ))}
                  {p.stack.length > 3 && <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, alignSelf: "center" }}>+{p.stack.length - 3}</span>}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <Prg value={p.progress} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: T.mono, marginBottom: 10 }}>
                  <span style={{ color: T.t2, fontWeight: 700 }}>{p.progress}%</span>
                  <span style={{ color: d < 0 ? T.red : d < 30 ? T.amber : T.t3 }}>{p.status === "active" ? (d < 0 ? `${-d}d overdue` : `${d}d left`) : p.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${T.cardBorder}` }}>
                  <div style={{ display: "flex" }}>
                    {p.team.slice(0, 3).map((m, i) => (
                      <div key={i} style={{ marginLeft: i > 0 ? -7 : 0, zIndex: 3 - i }}>
                        <Av initials={m.avatar} size={26} idx={i} />
                      </div>
                    ))}
                    {p.team.length > 3 && (
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: `1.5px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.t3, marginLeft: -7, fontFamily: T.mono }}>
                        +{p.team.length - 3}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Tag label={pcfg.label} color={pcfg.color} bg={pcfg.bg} />
                    <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{fmt(p.budget)}</span>
                    {openPRs > 0 && <Tag label={`${openPRs} PR`} color={T.blue} bg={T.blueGlow} small />}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                  <Btn small variant="secondary" onClick={() => setEditTarget(p)}>
                    Edit
                  </Btn>
                  <Btn small variant="danger" onClick={() => handleDelete(p._id)}>
                    Delete
                  </Btn>
                </div>
              </Card>
            );
          })}
          {!visible.length && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: T.t3 }}>
              <p style={{ fontSize: 24, margin: "0 0 8px", color: T.blue }}>◎</p>
              <p style={{ margin: 0, fontSize: 12, fontFamily: T.mono }}>
                no {filter} projects{search ? ` matching "${search}"` : "."}
              </p>
            </div>
          )}
        </div>
      )}

      {view === "list" && (
        <Card noPad>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                {["", "Project", "Stack", "Progress", "Priority", "Deadline", "Budget", ""].map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.t2, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `2px solid ${T.cardBorder}`, fontFamily: T.mono, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const d = dLeft(p.deadline);
                return (
                  <tr
                    key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                    style={{ borderBottom: `1px solid ${T.cardBorder}`, cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = T.blueGlow)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: 14, color: T.cyan }}>{TYPE_ICON[p.type]}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.t1 }}>{p.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: T.t3, fontFamily: T.mono }}>⬡ {p.repo}</p>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {p.stack.slice(0, 2).map((s) => (
                          <StackTag key={s} label={s} />
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", width: 130 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Prg value={p.progress} h={4} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.t1, fontFamily: T.mono }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <Tag label={PRIORITY_CFG[p.priority].label} color={PRIORITY_CFG[p.priority].color} bg={PRIORITY_CFG[p.priority].bg} />
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 11, fontFamily: T.mono, color: d < 0 ? T.red : d < 30 ? T.amber : T.t2, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtD(p.deadline)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 11, fontFamily: T.mono, color: T.t2, whiteSpace: "nowrap" }}>{fmt(p.budget)}</td>
                    <td style={{ padding: "10px 14px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn small variant="secondary" onClick={() => setEditTarget(p)}>
                          Edit
                        </Btn>
                        <Btn small variant="danger" onClick={() => handleDelete(p._id)}>
                          ✕
                        </Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
