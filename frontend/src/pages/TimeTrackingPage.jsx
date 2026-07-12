import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../hooks/useCollection";
import { timeEntryService } from "../services/collectionServices";
import { apiErrorMessage } from "../services/api";
import { Card, StatCard, Select, Input, Btn, Prg, Tag } from "../components/ui/Primitives";
import ManualTimeEntryModal from "../components/features/ManualTimeEntryModal";

export default function TimeTrackingPage() {
  const T = useTheme();
  const { projects } = useData();
  const { user } = useAuth();
  const { data: entries, loading, create } = useCollection(timeEntryService);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState("");

  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerTask, setTimerTask] = useState("");
  const [timerProject, setTimerProject] = useState(projects[0]?._id || "");
  const timerRef = useRef(null);

  // Projects load asynchronously; if this page renders before they arrive,
  // make sure the timer's project selector doesn't stay stuck on "".
  useEffect(() => {
    if (!timerProject && projects.length > 0) {
      setTimerProject(projects[0]._id);
    }
  }, [projects, timerProject]);

  useEffect(() => {
    if (timerRunning) timerRef.current = setInterval(() => setTimerSecs((s) => s + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const fmtTimer = (s) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const stopAndLog = async () => {
    if (timerSecs > 0 && timerTask && timerProject) {
      setError("");
      const project = projects.find((p) => p._id === timerProject);
      try {
        await create({
          project: timerProject,
          projectName: project?.name || "",
          task: timerTask,
          engineer: user?.name || "You",
          hours: +(timerSecs / 3600).toFixed(2),
          billable: true,
        });
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    }
    setTimerRunning(false);
    setTimerSecs(0);
    setTimerTask("");
  };

  const logManual = async (payload) => {
    setError("");
    const project = projects.find((p) => p._id === payload.project);
    try {
      await create({
        project: payload.project,
        projectName: project?.name || "",
        task: payload.task,
        engineer: user?.name || "You",
        date: payload.date,
        hours: payload.hours,
        billable: payload.billable,
      });
      setShowManual(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const totalHours = entries.reduce((a, e) => a + e.hours, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((a, e) => a + e.hours, 0);
  const todayHours = entries.filter((e) => new Date(e.date).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]).reduce((a, e) => a + e.hours, 0);
  const byProject = projects.map((p) => ({ name: p.name, hours: entries.filter((e) => e.projectName === p.name).reduce((a, e) => a + e.hours, 0) })).filter((p) => p.hours > 0).sort((a, b) => b.hours - a.hours);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {showManual && (
        <ManualTimeEntryModal
          projects={projects}
          error={error}
          onSave={logManual}
          onClose={() => {
            setShowManual(false);
            setError("");
          }}
        />
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard label="Total Hours" value={`${totalHours.toFixed(1)}h`} icon="⏱️" color={T.blue} sub="all time entries" />
        <StatCard label="Billable" value={`${billableHours.toFixed(1)}h`} icon="💰" color={T.green} sub={`${totalHours ? Math.round((billableHours / totalHours) * 100) : 0}% of total`} />
        <StatCard label="Today" value={`${todayHours.toFixed(1)}h`} icon="📅" color={T.cyan} sub={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })} />
        <StatCard label="Avg/Day" value={`${(totalHours / 7).toFixed(1)}h`} icon="📊" color={T.amber} sub="last 7 days" />
      </div>

      <Card glow glowColor={timerRunning ? T.green : T.blue}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Live Timer</p>
          <Btn small variant="secondary" onClick={() => setShowManual(true)} disabled={projects.length === 0} icon="+">
            Log Manually
          </Btn>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 160 }}>
            <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: timerRunning ? T.green : T.t1, fontFamily: T.mono, letterSpacing: 2, textShadow: timerRunning ? `0 0 30px ${T.green}50` : "none", transition: "all 0.3s" }}>{fmtTimer(timerSecs)}</p>
            <p style={{ margin: "4px 0 0", fontSize: 10, color: T.t3, fontFamily: T.mono }}>{timerRunning ? "● RECORDING" : "STOPPED"}</p>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
            <Select value={timerProject} onChange={(e) => setTimerProject(e.target.value)} options={projects.map((p) => ({ value: p._id, label: p.name }))} />
            <Input value={timerTask} onChange={(e) => setTimerTask(e.target.value)} placeholder="What are you working on?" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!timerRunning ? (
              <Btn onClick={() => setTimerRunning(true)} variant="success" icon="▶">
                Start
              </Btn>
            ) : (
              <>
                <Btn onClick={() => setTimerRunning(false)} variant="secondary">
                  Pause
                </Btn>
                <Btn onClick={stopAndLog} variant="danger">
                  Stop & Log
                </Btn>
              </>
            )}
          </div>
        </div>
        {error && !showManual && <p style={{ color: T.red, fontSize: 12, fontFamily: T.mono, margin: "12px 0 0" }}>{error}</p>}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Recent Entries</p>
          {loading && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>loading…</p>}
          {entries.slice(0, 8).map((e) => (
            <div key={e._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${T.cardBorder}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.blueGlow, border: `1.5px solid ${T.blue}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: T.cyan, fontFamily: T.mono, flexShrink: 0 }}>
                {e.engineer?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.task}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontFamily: T.mono }}>
                  {e.projectName} · {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>{e.hours}h</p>
                <Tag label={e.billable ? "Billable" : "Non-bill"} color={e.billable ? T.green : T.t3} bg={e.billable ? T.greenGlow : "rgba(107,140,174,0.12)"} small />
              </div>
            </div>
          ))}
          {!loading && entries.length === 0 && <p style={{ fontSize: 12, color: T.t3, fontFamily: T.mono }}>No time entries logged yet.</p>}
        </Card>
        <Card>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 800, color: T.t2, textTransform: "uppercase", letterSpacing: 1, fontFamily: T.mono }}>Hours by Project</p>
          {byProject.map((p, i) => {
            const maxH = byProject[0]?.hours || 1;
            const col = [T.blue, T.cyan, T.green, T.violet, T.amber, T.red][i % 6];
            return (
              <div key={p.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: T.mono, flexShrink: 0 }}>{p.hours.toFixed(1)}h</span>
                </div>
                <Prg value={(p.hours / maxH) * 100} color={col} h={6} />
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
