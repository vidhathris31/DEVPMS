import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { useCollection } from "../hooks/useCollection";
import { fileService } from "../services/collectionServices";
import { resolveFileUrl, apiErrorMessage } from "../services/api";
import { formatBytes } from "../utils/formatters";
import { Card, StatCard, Tag, Btn, Select } from "../components/ui/Primitives";

const TYPE_ICON = { pdf: "📄", md: "📝", fig: "🎨", pptx: "📊", sql: "🗄️", docx: "📃", png: "🖼️", zip: "📦", other: "📄" };
const MAX_UPLOAD_MB = 25;

export default function FileManagementPage() {
  const T = useTheme();
  const location = useLocation();
  const { projects } = useData();
  const { data: files, loading, refresh, remove } = useCollection(fileService);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [uploadProject, setUploadProject] = useState(projects[0]?._id || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [highlightFileId] = useState(location.state?.highlightFileId || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!uploadProject && projects.length > 0) setUploadProject(projects[0]._id);
  }, [projects, uploadProject]);

  const typeColor = { pdf: T.red, md: T.cyan, fig: T.violet, pptx: T.amber, sql: T.green, docx: T.blue, png: T.pink, zip: T.t3, other: T.t3 };
  const filtered = files.filter((f) => filter === "all" || f.projectName === filter).filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  const totalBytes = files.reduce((a, f) => a + (f.size || 0), 0);

  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setUploadError(`File is too large — max ${MAX_UPLOAD_MB} MB`);
      return;
    }

    setUploadError("");
    setUploading(true);
    const project = projects.find((p) => p._id === uploadProject);
    try {
      await fileService.upload(file, uploadProject, project?.name || "");
      await refresh();
    } catch (err) {
      setUploadError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeleteError("");
    setDeletingId(file._id);
    try {
      await remove(file._id);
    } catch (err) {
      setDeleteError(apiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total Files" value={files.length} icon="📁" color={T.blue} sub={`${formatBytes(totalBytes)} used`} />
        <StatCard label="PDFs" value={files.filter((f) => f.type === "pdf").length} icon="📄" color={T.red} sub="documents" />
        <StatCard label="Storage Used" value={formatBytes(totalBytes)} icon="☁️" color={T.amber} sub="stored on the server" />
      </div>

      <Card style={{ padding: "14px 16px" }}>
        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Upload File</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ minWidth: 200 }}>
            <Select value={uploadProject} onChange={(e) => setUploadProject(e.target.value)} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFileChosen} style={{ display: "none" }} />
          <Btn onClick={() => fileInputRef.current?.click()} disabled={uploading || projects.length === 0} icon="⬆">
            {uploading ? "Uploading…" : "Choose File"}
          </Btn>
          <span style={{ fontSize: 11, color: T.t3, fontFamily: T.mono }}>max {MAX_UPLOAD_MB} MB</span>
        </div>
        {uploadError && <p style={{ margin: "8px 0 0", fontSize: 12, color: T.red, fontFamily: T.mono }}>{uploadError}</p>}
        {projects.length === 0 && <p style={{ margin: "8px 0 0", fontSize: 12, color: T.t3, fontFamily: T.mono }}>Create a project first — files are attached to a project.</p>}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 10, padding: 3, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: filter === "all" ? T.blue : "transparent", color: filter === "all" ? "#fff" : T.t2, fontSize: 11, cursor: "pointer", fontFamily: T.mono, fontWeight: filter === "all" ? 700 : 500 }}>
            All ({files.length})
          </button>
          {projects.filter((p) => files.some((f) => f.projectName === p.name)).map((p) => (
            <button
              key={p._id} onClick={() => setFilter(p.name)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: filter === p.name ? T.blue : "transparent", color: filter === p.name ? "#fff" : T.t2, fontSize: 11, cursor: "pointer", fontFamily: T.mono, fontWeight: filter === p.name ? 700 : 500 }}
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.t3, fontSize: 13 }}>⌕</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…" style={{ border: `1.5px solid ${T.cardBorder}`, borderRadius: 8, padding: "7px 12px 7px 28px", fontSize: 12, outline: "none", width: 200, background: T.bg2, color: T.t1, fontFamily: T.mono }} />
          </div>
        </div>
      </div>

      {loading && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>loading…</p>}
      {deleteError && <p style={{ fontSize: 12, color: T.red, fontFamily: T.mono }}>{deleteError}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
        {filtered.map((f) => {
          const ic = TYPE_ICON[f.type] || "📄";
          const col = typeColor[f.type] || T.t3;
          const isHighlighted = highlightFileId && String(f._id) === String(highlightFileId);
          return (
            <Card key={f._id} glow glowColor={col} style={isHighlighted ? { boxShadow: `0 0 0 1px ${T.cyan}, 0 0 20px ${T.cyan}50` } : undefined}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: col + "18", border: `1.5px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p style={{ margin: "3px 0", fontSize: 11, color: T.cyan, fontFamily: T.mono }}>{f.projectName}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    <Tag label={formatBytes(f.size)} color={col} bg={col + "18"} small />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 11, color: T.t3, fontFamily: T.mono }}>
                  by {f.uploadedByName || "—"} · {new Date(f.createdAt).toLocaleDateString()}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {f.url && (
                    <Btn small variant="secondary" onClick={() => window.open(resolveFileUrl(f.url), "_blank")}>
                      ⬇
                    </Btn>
                  )}
                  <Btn small variant="danger" onClick={() => handleDelete(f)} disabled={deletingId === f._id}>
                    {deletingId === f._id ? "…" : "✕"}
                  </Btn>
                </div>
              </div>
            </Card>
          );
        })}
        {!loading && filtered.length === 0 && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>No files uploaded yet.</p>}
      </div>
    </div>
  );
}
