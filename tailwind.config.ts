import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        td: {
          bg: "#0d1712",
          surface: "#141f1a",
          surface2: "#1a2b23",
          gold: "#c9a227",
          goldsoft: "#e6c65a",
          red: "#a24141",
          cream: "#f0ece1",
          muted: "#7c9187",
          border: "#223229",
        },
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
