import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../theme/ThemeContext";
import { askAI } from "../../services/aiService";
import { Card } from "../ui/Primitives";

/**
 * @param {Object} props
 * @param {string} props.feature - one of the backend's AI feature keys
 * @param {string} props.label - short label shown in the terminal header, e.g. "analyst.ai"
 * @param {string} props.initialMessage - first assistant message
 * @param {string} props.systemPrompt - system prompt sent with every turn (built by the caller from live data)
 * @param {string[]} [props.quickQueries] - suggested prompts shown in the side panel
 * @param {import('react').ReactNode} [props.sidePanel] - extra content rendered below quick queries
 * @param {string} [props.projectId] - optional project id for history scoping
 * @param {number} [props.maxTokens]
 */
export default function AiChatPanel({ feature, label, initialMessage, systemPrompt, quickQueries = [], sidePanel, projectId, maxTokens = 1000 }) {
  const T = useTheme();
  const [msgs, setMsgs] = useState([{ role: "assistant", text: initialMessage }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);

    const history = msgs.slice(1).map((m) => ({ role: m.role, content: m.text }));
    const clean = [];
    for (const turn of history) {
      if (!clean.length || clean[clean.length - 1].role !== turn.role) clean.push(turn);
    }
    const newMessages = [...clean, { role: "user", content: msg }];
    setMsgs((m) => [...m, { role: "user", text: msg }]);

    try {
      const reply = await askAI({ feature, system: systemPrompt, messages: newMessages, project: projectId, maxTokens });
      setMsgs((m) => [...m, { role: "assistant", text: reply || "> err: empty response" }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: "assistant", text: `> err: ${err.message || "network error"}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: quickQueries.length || sidePanel ? "1fr 300px" : "1fr", gap: 16, height: "calc(100vh - 130px)" }}>
      <Card noPad style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
        <div style={{ background: "rgba(0,0,0,0.5)", padding: "10px 16px", borderBottom: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", gap: 8, borderRadius: "14px 14px 0 0" }}>
          {[T.red, T.amber, T.green].map((c, i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block", boxShadow: i === 2 ? `0 0 6px ${c}` : "" }} />
          ))}
          <span style={{ fontSize: 11, color: T.cyan, marginLeft: 8, fontFamily: T.mono }}>{label} — groq</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: T.green, fontFamily: T.mono }}>● live</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
              {m.role === "assistant" && (
                <div style={{ width: 24, height: 24, borderRadius: 7, background: T.blueGlow, border: `1px solid ${T.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.blue, flexShrink: 0 }}>✦</div>
              )}
              <div
                style={{
                  maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
                  background: m.role === "user" ? T.blue : "rgba(255,255,255,0.03)", color: m.role === "user" ? "#fff" : T.t1, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                  fontFamily: m.role === "assistant" ? T.mono : T.sans, border: m.role === "assistant" ? `1px solid ${T.cardBorder}` : "none",
                  boxShadow: m.role === "user" ? `0 0 20px ${T.blue}25` : "none",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: T.blueGlow, border: `1px solid ${T.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.blue }}>✦</div>
              <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: `1.5px solid ${T.cardBorder}`, borderRadius: "2px 12px 12px 12px", display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.blue, display: "inline-block", animation: `devpms-bounce 1s ${i * 0.18}s infinite ease-in-out` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.cardBorder}`, display: "flex", gap: 8 }}>
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="> query the analyst…  (Enter to send)" rows={2}
            style={{ flex: 1, border: `1.5px solid ${T.cardBorder}`, borderRadius: 9, padding: "9px 12px", fontSize: 12, resize: "none", fontFamily: T.mono, background: T.bg2, color: T.cyan, outline: "none", lineHeight: 1.5 }}
          />
          <button
            onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 42, height: 42, borderRadius: 9, background: input.trim() && !loading ? T.blue : "rgba(255,255,255,0.04)", color: "#fff", border: `1.5px solid ${T.cardBorder}`, cursor: input.trim() && !loading ? "pointer" : "default", fontSize: 16, flexShrink: 0, boxShadow: input.trim() && !loading ? `0 0 16px ${T.blue}40` : "none", transition: "all 0.15s" }}
          >
            →
          </button>
        </div>
      </Card>
      {(quickQueries.length > 0 || sidePanel) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {quickQueries.length > 0 && (
            <Card>
              <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: T.t3, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: T.mono }}>Quick Queries</p>
              {quickQueries.map((q, i) => (
                <button
                  key={i} onClick={() => send(q)}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "rgba(255,255,255,0.05)", border: `1.5px solid ${T.cardBorder}`, borderRadius: 7, padding: "8px 10px", fontSize: 12, color: T.t2, cursor: "pointer", marginBottom: 5, transition: "all 0.1s", fontFamily: T.mono, lineHeight: 1.5, fontWeight: 500 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = T.blueGlow;
                    e.currentTarget.style.borderColor = T.blue + "50";
                    e.currentTarget.style.color = T.cyan;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = T.cardBorder;
                    e.currentTarget.style.color = T.t2;
                  }}
                >
                  &gt; {q}
                </button>
              ))}
            </Card>
          )}
          {sidePanel}
        </div>
      )}
      <style>{`@keyframes devpms-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
