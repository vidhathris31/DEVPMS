import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import { useData } from "../context/DataContext";
import { settingsService } from "../services/settingsService";
import { Card, Ring, Tag, Prg, Select, Input, Av } from "../components/ui/Primitives";

export default function MoodBoardPage() {
  const T = useTheme();
  const { employees } = useData();
  const MOODS = [
    { emoji: "🔥", label: "On Fire", value: 5, color: T.red },
    { emoji: "⚡", label: "Energized", value: 4, color: T.amber },
    { emoji: "◎", label: "Steady", value: 3, color: T.cyan },
    { emoji: "◈", label: "Tired", value: 2, color: T.violet },
    { emoji: "◆", label: "Burnt Out", value: 1, color: T.t3 },
  ];
  const today = new Date().toISOString().split("T")[0];
  const [moods, setMoods] = useState({});
  const [note, setNote] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?._id);

  useEffect(() => {
    if (!selectedEmp && employees[0]) setSelectedEmp(employees[0]._id);
  }, [employees, selectedEmp]);

  useEffect(() => {
    settingsService
      .get()
      .then((settings) => setMoods(settings.moods || {}))
      .catch(() => {});
  }, []);

  const submitMood = async (empId, moodValue) => {
    try {
      const updated = await settingsService.setMood(empId, moodValue, note);
      setMoods(updated.moods || {});
      setNote("");
    } catch {
      // non-fatal — mood check-ins are a nice-to-have, not critical path
    }
  };

  const getEmpMood = (empId) => {
    const entry = moods[empId];
    if (!entry) return null;
    const isToday = new Date(entry.date).toISOString().split("T")[0] === today;
    return isToday ? entry : null;
  };

  const allTodayMoods = employees.map((e) => getEmpMood(e._id)).filter(Boolean);
  const avgMood = allTodayMoods.length ? allTodayMoods.reduce((a, m) => a + Number(m.mood), 0) / allTodayMoods.length : 0;
  const teamHealthColor = avgMood >= 4 ? T.green : avgMood >= 3 ? T.cyan : avgMood >= 2 ? T.amber : T.red;
  const teamHealthLabel = avgMood >= 4 ? "Thriving" : avgMood >= 3 ? "Healthy" : avgMood >= 2 ? "Fatigued" : "Burnout Risk";
  const moodDist = MOODS.map((m) => ({ ...m, count: allTodayMoods.filter((x) => Number(x.mood) === m.value).length }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card glow glowColor={teamHealthColor} style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Team Health</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <Ring value={Math.round(avgMood * 20)} size={64} color={teamHealthColor} thickness={5} />
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.t1, fontFamily: T.mono }}>{avgMood ? avgMood.toFixed(1) : "-"}/5</p>
              <Tag label={teamHealthLabel} color={teamHealthColor} bg={teamHealthColor + "18"} dot />
            </div>
          </div>
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Today&apos;s Mood Distribution</p>
          {moodDist.map((m) => (
            <div key={m.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14, width: 20 }}>{m.emoji}</span>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: allTodayMoods.length ? `${(m.count / employees.length) * 100}%` : "0%", background: m.color, borderRadius: 3, boxShadow: `0 0 6px ${m.color}`, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 10, color: T.t3, fontFamily: T.mono, width: 16, textAlign: "right" }}>{m.count}</span>
            </div>
          ))}
        </Card>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Check-in Rate</p>
          <p style={{ margin: "4px 0 8px", fontSize: 28, fontWeight: 800, color: T.t1, fontFamily: T.mono }}>
            {allTodayMoods.length}/{employees.length}
          </p>
          <Prg value={(allTodayMoods.length / (employees.length || 1)) * 100} color={T.cyan} h={6} />
          <p style={{ margin: "8px 0 0", fontSize: 10, color: T.t3, fontFamily: T.mono }}>{today}</p>
        </Card>
      </div>

      <Card>
        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Log Today&apos;s Mood</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Select value={selectedEmp || ""} onChange={(e) => setSelectedEmp(e.target.value)} style={{ width: 200 }} options={employees.map((e) => ({ value: e._id, label: e.name }))} />
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note…" style={{ flex: 1, minWidth: 160 }} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MOODS.map((m) => {
            const already = getEmpMood(selectedEmp);
            const isSelected = Number(already?.mood) === m.value;
            return (
              <button
                key={m.value} onClick={() => submitMood(selectedEmp, m.value)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 16px", borderRadius: 10, border: `2px solid ${isSelected ? m.color : T.cardBorder}`, background: isSelected ? m.color + "18" : "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.15s", boxShadow: isSelected ? `0 0 16px ${m.color}30` : "none" }}
              >
                <span style={{ fontSize: 24 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? m.color : T.t3, fontFamily: T.mono }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Engineer Check-ins — Today</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
          {employees.map((emp, i) => {
            const m = getEmpMood(emp._id);
            const moodCfg = m ? MOODS.find((mo) => mo.value === Number(m.mood)) : null;
            return (
              <div key={emp._id} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: `1px solid ${m ? moodCfg?.color + "40" : T.cardBorder}`, borderRadius: 10, alignItems: "center", transition: "border-color 0.3s" }}>
                <Av initials={emp.avatar} size={34} idx={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</p>
                  {m ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <span style={{ fontSize: 14 }}>{moodCfg?.emoji}</span>
                        <span style={{ fontSize: 10, color: moodCfg?.color, fontFamily: T.mono, fontWeight: 600 }}>{moodCfg?.label}</span>
                      </div>
                      {m.note && <p style={{ margin: "2px 0 0", fontSize: 11, color: T.t3, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.note}</p>}
                    </div>
                  ) : (
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: T.t3, fontFamily: T.mono }}>not checked in</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
