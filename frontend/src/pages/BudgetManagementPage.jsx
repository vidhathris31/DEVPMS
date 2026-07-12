import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { useCollection } from "../hooks/useCollection";
import { expenseService } from "../services/collectionServices";
import { apiErrorMessage } from "../services/api";
import { fmt } from "../utils/formatters";
import { Card, StatCard, Tag, Btn, Modal, FL, Select, Input } from "../components/ui/Primitives";

const CATEGORIES = ["Infrastructure", "Personnel", "Tools", "AI/ML", "Compliance", "Security", "Other"];
const blankExpense = (defaultProject) => ({ project: defaultProject || "", category: "Infrastructure", description: "", amount: "" });

export default function BudgetManagementPage() {
  const T = useTheme();
  const location = useLocation();
  const { projects } = useData();
  const { data: expenses, loading, create, update, remove } = useCollection(expenseService);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [newExp, setNewExp] = useState(blankExpense(projects[0]?._id));
  const [editExp, setEditExp] = useState(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [highlightExpenseId] = useState(location.state?.highlightExpenseId || null);

  useEffect(() => {
    if (!newExp.project && projects.length > 0) {
      setNewExp((n) => ({ ...n, project: projects[0]._id }));
    }
  }, [projects, newExp.project]);

  const totalBudget = projects.reduce((a, p) => a + p.budget, 0) || 1;
  const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
  const expenseTotal = expenses.reduce((a, e) => a + e.amount, 0) || 1;

  const addExpense = async () => {
    if (!newExp.description || !newExp.amount || !newExp.project) return;
    setError("");
    const project = projects.find((p) => p._id === newExp.project);
    try {
      await create({ ...newExp, projectName: project?.name || "", amount: Number(newExp.amount) });
      setShowAdd(false);
      setNewExp(blankExpense(projects[0]?._id));
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const openEdit = (e) => {
    setEditTarget(e);
    setEditExp({ project: e.project, category: e.category, description: e.description, amount: String(e.amount) });
    setError("");
  };

  const saveEdit = async () => {
    if (!editExp.description || !editExp.amount || !editExp.project) return;
    setError("");
    const project = projects.find((p) => p._id === editExp.project);
    try {
      await update(editTarget._id, { ...editExp, projectName: project?.name || editTarget.projectName, amount: Number(editExp.amount) });
      setEditTarget(null);
      setEditExp(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Delete this expense — "${expense.description}"? This cannot be undone.`)) return;
    setDeleteError("");
    setDeletingId(expense._id);
    try {
      await remove(expense._id);
    } catch (err) {
      setDeleteError(apiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const catTotals = CATEGORIES.map((cat) => ({ cat, total: expenses.filter((e) => e.category === cat).reduce((a, e) => a + e.amount, 0) })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {showAdd && (
        <Modal title="Log Expense" onClose={() => setShowAdd(false)}>
          <FL label="Project">
            <Select value={newExp.project} onChange={(e) => setNewExp((n) => ({ ...n, project: e.target.value }))} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
          </FL>
          <FL label="Category">
            <Select value={newExp.category} onChange={(e) => setNewExp((n) => ({ ...n, category: e.target.value }))} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </FL>
          <FL label="Description" required>
            <Input value={newExp.description} onChange={(e) => setNewExp((n) => ({ ...n, description: e.target.value }))} placeholder="e.g. AWS EC2 monthly" />
          </FL>
          <FL label="Amount (₹)" required>
            <Input type="number" value={newExp.amount} onChange={(e) => setNewExp((n) => ({ ...n, amount: e.target.value }))} placeholder="e.g. 85000" />
          </FL>
          {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "0 0 8px" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Btn>
            <Btn onClick={addExpense} disabled={!newExp.description || !newExp.amount || !newExp.project}>
              Log Expense
            </Btn>
          </div>
        </Modal>
      )}

      {editTarget && editExp && (
        <Modal title="Edit Expense" sub={`id:${editTarget._id}`} onClose={() => setEditTarget(null)}>
          <FL label="Project">
            <Select value={editExp.project} onChange={(e) => setEditExp((n) => ({ ...n, project: e.target.value }))} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
          </FL>
          <FL label="Category">
            <Select value={editExp.category} onChange={(e) => setEditExp((n) => ({ ...n, category: e.target.value }))} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
          </FL>
          <FL label="Description" required>
            <Input value={editExp.description} onChange={(e) => setEditExp((n) => ({ ...n, description: e.target.value }))} placeholder="e.g. AWS EC2 monthly" />
          </FL>
          <FL label="Amount (₹)" required>
            <Input type="number" value={editExp.amount} onChange={(e) => setEditExp((n) => ({ ...n, amount: e.target.value }))} placeholder="e.g. 85000" />
          </FL>
          {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "0 0 8px" }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Btn>
            <Btn onClick={saveEdit} disabled={!editExp.description || !editExp.amount || !editExp.project}>
              Save Changes
            </Btn>
          </div>
        </Modal>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total Budget" value={fmt(totalBudget)} icon="💰" color={T.green} sub="all projects" />
        <StatCard label="Total Spent" value={fmt(totalSpent)} icon="📤" color={T.amber} sub={`${Math.round((totalSpent / totalBudget) * 100)}% burn rate`} />
        <StatCard label="Logged Expenses" value={fmt(expenseTotal)} icon="🧾" color={T.blue} sub={`${expenses.length} entries`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Budget vs Actual — Per Project</p>
          {projects.filter((p) => p.status === "active").map((p) => {
            const pct = Math.round((p.spent / (p.budget || 1)) * 100);
            const col = pct > 85 ? T.red : pct > 65 ? T.amber : T.green;
            return (
              <div key={p._id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: T.mono, flexShrink: 0 }}>{pct}%</span>
                </div>
                <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${col}CC,${col})`, borderRadius: 4, boxShadow: `0 0 12px ${col}70` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{fmt(p.spent)} spent</span>
                  <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{fmt(p.budget)} budget</span>
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Spend by Category</p>
          {catTotals.map((c, i) => {
            const col = [T.blue, T.cyan, T.green, T.violet, T.amber, T.red][i % 6];
            const pct = Math.round((c.total / expenseTotal) * 100);
            return (
              <div key={c.cat} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.t2, fontFamily: T.mono }}>{c.cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: T.mono }}>{fmt(c.total)}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 3, boxShadow: `0 0 6px ${col}` }} />
                </div>
              </div>
            );
          })}
          {catTotals.length === 0 && !loading && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>No expenses logged yet.</p>}
        </Card>
      </div>

      <Card noPad>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${T.cardBorder}` }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Expense Log</p>
          <Btn small onClick={() => setShowAdd(true)} disabled={projects.length === 0} icon="+">
            Log Expense
          </Btn>
        </div>
        {deleteError && <p style={{ padding: "0 16px", fontSize: 12, color: T.red, fontFamily: T.mono }}>{deleteError}</p>}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)" }}>
              {["Project", "Category", "Description", "Amount", "Date", ""].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.t2, textTransform: "uppercase", letterSpacing: 0.6, borderBottom: `2px solid ${T.cardBorder}`, fontFamily: T.mono }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => {
              const isHighlighted = highlightExpenseId && String(e._id) === String(highlightExpenseId);
              return (
                <tr
                  key={e._id} style={{ borderBottom: `1px solid ${T.cardBorder}`, transition: "background 0.1s", background: isHighlighted ? T.cyanGlow : "transparent" }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = T.blueGlow)}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = isHighlighted ? T.cyanGlow : "transparent")}
                >
                  <td style={{ padding: "10px 14px", fontSize: 12, color: T.cyan, fontFamily: T.mono, fontWeight: 600 }}>{e.projectName?.split(" ")[0]}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Tag label={e.category} color={T.violet} bg={T.violetGlow} small />
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: T.t1, fontWeight: 500 }}>{e.description}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 800, color: T.amber, fontFamily: T.mono }}>{fmt(e.amount)}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: T.t3, fontFamily: T.mono }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Btn small variant="secondary" onClick={() => openEdit(e)}>
                        Edit
                      </Btn>
                      <Btn small variant="danger" onClick={() => handleDelete(e)} disabled={deletingId === e._id}>
                        {deletingId === e._id ? "…" : "✕"}
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && expenses.length === 0 && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono, padding: 16 }}>No expenses logged yet.</p>}
      </Card>
    </div>
  );
}
