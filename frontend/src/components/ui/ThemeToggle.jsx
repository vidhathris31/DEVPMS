import { useTheme, useThemeMode } from "../../theme/ThemeContext";

/**
 * A sun/moon switch for toggling dark/light mode.
 * `compact` renders just the switch (for tight spaces like Settings rows);
 * the default renders the switch plus a text label (for the header).
 */
export default function ThemeToggle({ compact = false }) {
  const T = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        display: "flex", alignItems: "center", gap: compact ? 0 : 8, padding: compact ? 0 : "6px 10px",
        borderRadius: 20, border: compact ? "none" : `1.5px solid ${T.cardBorder}`,
        background: compact ? "transparent" : "rgba(255,255,255,0.05)", cursor: "pointer", fontFamily: T.mono,
      }}
    >
      {!compact && <span style={{ fontSize: 11, color: T.t2 }}>{isDark ? "☾ Dark" : "☀ Light"}</span>}
      <span
        style={{
          position: "relative", width: 38, height: 20, borderRadius: 10,
          background: isDark ? T.blue : "#E2E8F0", transition: "background 0.2s", flexShrink: 0,
          boxShadow: isDark ? `0 0 8px ${T.blue}50` : "none",
        }}
      >
        <span
          style={{
            position: "absolute", top: 2, left: isDark ? 20 : 2, width: 16, height: 16, borderRadius: "50%",
            background: "#fff", transition: "left 0.2s cubic-bezier(.4,0,.2,1)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 9, boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          {isDark ? "☾" : "☀"}
        </span>
      </span>
    </button>
  );
}
