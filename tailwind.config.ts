import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        td: {
          bg: "#0a0a0c",
          surface: "#17181c",
          surface2: "#202227",
          gold: "#c8202f",
          goldsoft: "#2ecc71",
          red: "#8a1620",
          cream: "#eceef0",
          muted: "#84909c",
          border: "#26282f",
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
