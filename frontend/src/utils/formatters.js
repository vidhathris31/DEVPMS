export const fmt = (n) => {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${sign}₹${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}₹${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
};
export const fmtD = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const dLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};
