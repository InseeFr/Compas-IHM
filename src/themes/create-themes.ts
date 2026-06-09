import { createTheme } from "@mui/material/styles";

const sharedPalette = {
  error: {
    light: "#dc2626",
    dark: "#991b1b",
    contrastText: "#ffffff",
  },
  warning: {
    light: "#d97706",
    dark: "#78350f",
    contrastText: "#ffffff",
  },
  success: {
    light: "#16a34a",
    dark: "#14532d",
    contrastText: "#ffffff",
  },
  info: {
    light: "#0284c7",
    dark: "#075985",
    contrastText: "#ffffff",
  },
} as const;

export const lightTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    ...sharedPalette,
    primary: {
      main: "#1d4ed8",
      light: "#3b82f6",
      dark: "#1e3a8a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
      light: "#8b5cf6",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    error: {
      ...sharedPalette.error,
      main: "#b91c1c",
    },
    warning: {
      ...sharedPalette.warning,
      main: "#92400e",
    },
    success: {
      ...sharedPalette.success,
      main: "#15803d",
    },
    info: {
      ...sharedPalette.info,
      main: "#0369a1",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      disabled: "#94a3b8",
    },
    divider: "rgba(15, 23, 42, 0.12)",
    action: {
      active: "#0f172a",
      hover: "rgba(15, 23, 42, 0.06)",
      selected: "rgba(29, 78, 216, 0.12)",
      disabled: "#94a3b8",
      disabledBackground: "rgba(148, 163, 184, 0.24)",
      focus: "rgba(29, 78, 216, 0.20)",
    },
  },
});

export const darkTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#60a5fa",
      light: "#93c5fd",
      dark: "#3b82f6",
      contrastText: "#000000",
    },
    secondary: {
      main: "#c084fc",
      light: "#d8b4fe",
      dark: "#a855f7",
      contrastText: "#000000",
    },
    error: {
      ...sharedPalette.error,
      main: "#f87171",
      contrastText: "#000000",
    },
    warning: {
      ...sharedPalette.warning,
      main: "#fbbf24",
      contrastText: "#000000",
    },
    success: {
      ...sharedPalette.success,
      main: "#4ade80",
      contrastText: "#000000",
    },
    info: {
      ...sharedPalette.info,
      main: "#38bdf8",
      contrastText: "#000000",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a3a3a3",
      disabled: "#525252",
    },
    divider: "rgba(255, 255, 255, 0.12)",
    action: {
      active: "#ffffff",
      hover: "rgba(255, 255, 255, 0.08)",
      selected: "rgba(96, 165, 250, 0.16)",
      disabled: "#525252",
      disabledBackground: "rgba(82, 82, 82, 0.24)",
      focus: "rgba(96, 165, 250, 0.24)",
    },
  },
});