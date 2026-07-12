import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../hooks/useCollection";
import { commentService } from "../services/collectionServices";
import { apiErrorMessage } from "../services/api";
import { Card, StatCard, Select, Input, Btn, Av } from "../components/ui/Primitives";

export default function CollaborationPage() {
  const T = useTheme();
  const { projects, employees } = useData();
  const { user } = useAuth();
  const { data: comments, loading, create } = useCollection(commentService);
  const [newComment, setNewComment] = useState("");
  const [selProject, setSelProject] = useState(projects[0]?._id || "");
  const [selTask, setSelTask] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selProject && projects.length > 0) setSelProject(projects[0]._id);
  }, [projects, selProject]);

  const addComment = async () => {
    if (!newComment.trim() || !selProject) return;
    setError("");
    const project = projects.find((p) => p._id === selProject);
    try {
      await create({
        project: selProject,
        projectName: project?.name || "",
        task: selTask || "General",
        author: user?.name || "You",
        authorAvatar: user?.name?.slice(0, 2).toUpperCase() || "U",
        text: newComment,
      });
      setNewComment("");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Comments" value={comments.length} icon="💬" color={T.blue} sub="across all projects" />
        <StatCard label="Active Users" value={employees.filter((e) => e.status === "active").length} icon="◉" color={T.green} sub="on the roster" />
        <StatCard label="Projects" value={projects.length} icon="◎" color={T.amber} sub="in the workspace" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card noPad>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 6, borderRadius: "14px 14px 0 0" }}>
              {[T.red, T.amber, T.green].map((c, i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
              ))}
              <span style={{ fontSize: 11, color: T.t3, marginLeft: 8, fontFamily: T.mono }}>activity_feed.log</span>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {loading && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>loading…</p>}
              {comments.map((c, i) => {
                const empIdx = employees.findIndex((e) => e.avatar === c.authorAvatar);
                return (
                  <div key={c._id} style={{ display: "flex", gap: 10 }}>
                    <Av initials={c.authorAvatar} size={32} idx={empIdx >= 0 ? empIdx : i} />
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.cyan, fontFamily: T.mono }}>{c.author}</span>
                        <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono }}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: T.t3, fontFamily: T.mono }}>
                        {c.projectName} › {c.task}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: T.t1, lineHeight: 1.5 }}>{c.text}</p>
                    </div>
                  </div>
                );
              })}
              {!loading && comments.length === 0 && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>No comments yet — be the first to post one.</p>}
            </div>
          </Card>

          <Card>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Add Comment</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Select value={selProject} onChange={(e) => setSelProject(e.target.value)} style={{ flex: 1, fontSize: 12 }} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
              <Input value={selTask} onChange={(e) => setSelTask(e.target.value)} placeholder="Task name (optional)" style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addComment();
                  }
                }}
                style={{ flex: 1 }}
              />
              <Btn onClick={addComment} disabled={!newComment.trim() || !selProject}>
                Post
              </Btn>
            </div>
            {error && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "8px 0 0" }}>{error}</p>}
            {projects.length === 0 && <p style={{ color: T.t3, fontSize: 12, fontFamily: T.mono, margin: "8px 0 0" }}>Create a project first — comments are attached to a project.</p>}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Team Roster</p>
            {employees.map((e, i) => (
              <div key={e._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
                <div style={{ position: "relative" }}>
                  <Av initials={e.avatar} size={28} idx={i} />
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: e.status === "active" ? T.green : T.t3, border: `1.5px solid ${T.card}` }} />
                </div>
                <span style={{ fontSize: 13, color: T.t1, fontWeight: 600, flex: 1 }}>{e.name}</span>
                <span style={{ fontSize: 10, color: e.status === "active" ? T.green : T.t3, fontFamily: T.mono, textTransform: "capitalize" }}>{e.status}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
