import { createContext, useContext, useEffect, useMemo, useState } from "react";

const mono = "'JetBrains Mono','Fira Code',monospace";
const sans = "'Inter',system-ui,sans-serif";

export const DARK_THEME = {
  name: "dark",
  bg: "#04080F", bg2: "#080F1E", bg3: "#0C1428",
  card: "#0F1A2E", cardHov: "#162440", cardBorder: "#1E3A5F",
  blue: "#60A5FA", blueD: "#3B82F6", blueGlow: "rgba(96,165,250,0.2)",
  cyan: "#34D4F0", cyanGlow: "rgba(52,212,240,0.18)",
  violet: "#C4B5FD", violetGlow: "rgba(196,181,253,0.18)",
  green: "#4ADE80", greenGlow: "rgba(74,222,128,0.18)",
  amber: "#FCD34D", amberGlow: "rgba(252,211,77,0.18)",
  red: "#FC8181", redGlow: "rgba(252,129,129,0.18)",
  pink: "#F472B6",
  t1: "#F0F6FF", t2: "#B8CCE8", t3: "#6B8CAE", t4: "#3D5A7A",
  sidebarBg: "#070E1C",
  headerBg: "rgba(7,14,28,0.98)",
  mainBg: "#050C19",
  mono, sans,
};

export const LIGHT_THEME = {
  name: "light",
  bg: "#F4F7FC", bg2: "#EAF0FA", bg3: "#E1E9F6",
  card: "#FFFFFF", cardHov: "#F3F6FC", cardBorder: "#D7E1F2",
  blue: "#2563EB", blueD: "#1D4ED8", blueGlow: "rgba(37,99,235,0.14)",
  cyan: "#0891B2", cyanGlow: "rgba(8,145,178,0.14)",
  violet: "#7C3AED", violetGlow: "rgba(124,58,237,0.14)",
  green: "#16A34A", greenGlow: "rgba(22,163,74,0.14)",
  amber: "#D97706", amberGlow: "rgba(217,119,6,0.14)",
  red: "#DC2626", redGlow: "rgba(220,38,38,0.14)",
  pink: "#DB2777",
  t1: "#0B1728", t2: "#334155", t3: "#64748B", t4: "#94A3B8",
  sidebarBg: "#FFFFFF",
  headerBg: "rgba(255,255,255,0.98)",
  mainBg: "#F7F9FD",
  mono, sans,
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("devpms:theme") || "dark";
  });

  useEffect(() => {
    window.localStorage.setItem("devpms:theme", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      T: mode === "dark" ? DARK_THEME : LIGHT_THEME,
      toggleTheme: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      setTheme: setMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Returns the active theme's color/token object (equivalent to the old static `T`). */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx.T;
}

/** Returns { mode, toggleTheme, setTheme } for building a theme switch control. */
export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within a ThemeProvider");
  return ctx;
}
