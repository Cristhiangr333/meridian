import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#F8F4EC",
        surface: {
          DEFAULT: "rgba(255,255,255,.55)",
          raised: "rgba(255,255,255,.68)",
          elevated: "rgba(255,255,255,.92)",
        },
        hairline: {
          DEFAULT: "rgba(28,18,41,.08)",
          strong: "rgba(28,18,41,.16)",
        },
        violet: {
          DEFAULT: "#6B2FB3",
          soft: "rgba(107,47,179,.09)",
          glow: "rgba(107,47,179,.28)",
        },
        gold: {
          DEFAULT: "#A9812E",
          soft: "rgba(169,129,46,.12)",
          card: "#E8C878",
        },
        gain: {
          DEFAULT: "#0E9F6E",
          soft: "rgba(14,159,110,.10)",
        },
        loss: {
          DEFAULT: "#D1315C",
          soft: "rgba(209,49,92,.09)",
        },
        ink: {
          1: "#1C1229",
          2: "#5C5470",
          3: "#7A7190",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        tier: ["var(--font-tier)", "serif"],
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
