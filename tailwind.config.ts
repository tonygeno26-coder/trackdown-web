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
      borderRadius: {
        td: "22px",
        "td-lg": "24px",
      },
      boxShadow: {
        "td-glow": "0 0 48px color-mix(in srgb, #c8202f 28%, transparent)",
        "td-glow-sm": "0 0 24px color-mix(in srgb, #c8202f 18%, transparent)",
        "td-card": "0 1px 0 color-mix(in srgb, #eceef0 4%, transparent)",
      },
      backgroundImage: {
        "playing-radial":
          "radial-gradient(ellipse 90% 60% at 50% -8%, color-mix(in srgb, #c8202f 10%, transparent), transparent 65%)",
        "playing-radial-bottom":
          "radial-gradient(ellipse 70% 40% at 50% 110%, color-mix(in srgb, #2ecc71 4%, transparent), transparent 60%)",
        "td-gradient-red": "linear-gradient(135deg, #c8202f 0%, #8a1620 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
