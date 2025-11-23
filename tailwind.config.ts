import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg-light)",
        foreground: "var(--color-text-light)",
        accent: "var(--color-accent)",
        accentSoft: "var(--color-accent-soft)",
        cardBg: "var(--card-bg-light)",
        cardBorder: "var(--card-border-light)",
      },
      boxShadow: {
        cardLight: "var(--shadow-card-light)",
        cardDark: "var(--shadow-card-dark)",
        glow: "0 0 40px rgba(255, 34, 34, 0.45)",
      },
      fontFamily: {
        bangers: "var(--font-heading)",
        'dm-sans': "var(--font-body)",
      },
    },
  },
  plugins: [],
};
export default config;

