export const futuristicTheme = {
  name: "aurora-neon",
  colors: {
    background: "#050816",
    backgroundAlt: "#0a1022",
    surface: "rgba(15, 23, 42, 0.58)",
    surfaceStrong: "rgba(15, 23, 42, 0.82)",
    border: "rgba(148, 163, 184, 0.16)",
    text: "#f8fafc",
    textMuted: "#94a3b8",
    cyan: "#67e8f9",
    blue: "#60a5fa",
    violet: "#c084fc",
    green: "#86efac",
    rose: "#fda4af"
  },
  radii: { panel: "28px", inner: "20px", pill: "999px" },
  shadows: {
    panel: "0 24px 80px rgba(2, 6, 23, 0.52)",
    glowCyan: "0 0 40px rgba(103, 232, 249, 0.22)",
    glowViolet: "0 0 48px rgba(192, 132, 252, 0.18)"
  },
  blur: { glass: "18px" }
};

export function toCssVars(theme) {
  return {
    "--bg": theme.colors.background,
    "--bg-alt": theme.colors.backgroundAlt,
    "--surface": theme.colors.surface,
    "--surface-strong": theme.colors.surfaceStrong,
    "--border": theme.colors.border,
    "--text": theme.colors.text,
    "--text-muted": theme.colors.textMuted,
    "--accent-cyan": theme.colors.cyan,
    "--accent-blue": theme.colors.blue,
    "--accent-violet": theme.colors.violet,
    "--accent-green": theme.colors.green,
    "--accent-rose": theme.colors.rose,
    "--radius-panel": theme.radii.panel,
    "--radius-inner": theme.radii.inner,
    "--radius-pill": theme.radii.pill,
    "--shadow-panel": theme.shadows.panel,
    "--shadow-glow-cyan": theme.shadows.glowCyan,
    "--shadow-glow-violet": theme.shadows.glowViolet,
    "--blur-glass": theme.blur.glass
  };
}
