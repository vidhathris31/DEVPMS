import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useData } from "../../context/DataContext";
import { dLeft } from "../../utils/formatters";

const TYPE_ICON = { task_assigned: "✅", expense_added: "💰", file_uploaded: "📁" };

function timeAgo(date) {
  const secs = Math.floor((new Date() - new Date(date)) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default function Notifs({ projects, onClose }) {
  const T = useTheme();
  const navigate = useNavigate();
  const { notifications, notificationsLoading, markNotificationRead, markAllNotificationsRead } = useData();

  const openPrCount = projects.reduce((a, p) => a + (p.prs?.filter((pr) => pr.status === "open").length || 0), 0);

  // Existing live/computed alerts — unchanged, now also clickable (navigates to the related project).
  const liveAlerts = [
    ...projects.filter((p) => p.status === "active" && dLeft(p.deadline) < 0).map((p) => ({ text: `${p.name}: ${-dLeft(p.deadline)}d overdue`, icon: "◈", color: T.red, projectId: p._id })),
    ...projects.filter((p) => p.status === "active" && dLeft(p.deadline) >= 0 && dLeft(p.deadline) <= 30).map((p) => ({ text: `${p.name}: deadline in ${dLeft(p.deadline)}d`, icon: "◎", color: T.amber, projectId: p._id })),
    ...projects.filter((p) => p.status === "active" && p.spent / (p.budget || 1) > 0.85).map((p) => ({ text: `${p.name}: budget ${Math.round((p.spent / (p.budget || 1)) * 100)}% burned`, icon: "◆", color: T.amber, projectId: p._id })),
    ...(openPrCount > 0 ? [{ text: `${openPrCount} pull requests awaiting review`, icon: "⬡", color: T.blue, projectId: null }] : []),
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = liveAlerts.length + notifications.length;

  const goToProject = (projectId) => {
    if (!projectId) return;
    navigate(`/projects/${projectId}`);
    onClose();
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) markNotificationRead(n._id);

    if (n.type === "task_assigned" && n.project) {
      navigate(`/projects/${n.project}`, { state: { tab: "sprint", highlightTaskId: n.taskId } });
    } else if (n.type === "expense_added") {
      navigate("/budget", { state: { highlightExpenseId: n.expense } });
    } else if (n.type === "file_uploaded") {
      navigate("/files", { state: { highlightFileId: n.file } });
    }
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 54, right: 16, width: 330, background: `linear-gradient(145deg,${T.card},${T.bg2})`, border: `1px solid ${T.blue}35`, borderRadius: 14, boxShadow: `0 8px 40px rgba(0,0,0,0.5),0 0 0 1px ${T.blue}10`, zIndex: 500, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: `1px solid ${T.cardBorder}` }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>
          alerts.log
          {totalCount > 0 && <span style={{ background: T.red, color: "#fff", borderRadius: 8, fontSize: 9, padding: "1px 5px", marginLeft: 4 }}>{totalCount}</span>}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.blue, fontSize: 10, fontFamily: T.mono, fontWeight: 700, padding: 0 }}
            >
              Mark all as read
            </button>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.t3, fontSize: 14 }}>
            ✕
          </button>
        </div>
      </div>
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {totalCount === 0 && !notificationsLoading && <p style={{ padding: "20px", textAlign: "center", color: T.green, fontSize: 12, fontFamily: T.mono }}>all systems nominal ✓</p>}

        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNotificationClick(n)}
            style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${T.cardBorder}`, background: n.read ? "transparent" : T.blueGlow, cursor: "pointer", transition: "background 0.12s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = T.blueGlow)}
            onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : T.blueGlow)}
          >
            <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[n.type] || "🔔"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: n.read ? T.t3 : T.t1, fontFamily: T.mono, lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: T.t3, fontFamily: T.mono }}>{timeAgo(n.createdAt)}</p>
            </div>
            {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.blue, flexShrink: 0, marginTop: 4, boxShadow: `0 0 6px ${T.blue}` }} />}
          </div>
        ))}

        {liveAlerts.map((n, i) => (
          <div
            key={`live-${i}`}
            onClick={() => goToProject(n.projectId)}
            style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${T.cardBorder}`, background: n.color + "08", cursor: n.projectId ? "pointer" : "default" }}
            onMouseEnter={(e) => n.projectId && (e.currentTarget.style.background = n.color + "18")}
            onMouseLeave={(e) => (e.currentTarget.style.background = n.color + "08")}
          >
            <span style={{ fontSize: 13, color: n.color, flexShrink: 0, fontFamily: T.mono, filter: `drop-shadow(0 0 4px ${n.color})` }}>{n.icon}</span>
            <p style={{ margin: 0, fontSize: 11, color: n.color, fontFamily: T.mono, lineHeight: 1.5 }}>{n.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
