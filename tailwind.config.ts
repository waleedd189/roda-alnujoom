import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["var(--font-tajawal)", "sans-serif"],
        quran: ["var(--font-quran)", "serif"],
      },
      colors: {
        brand: {
          purple: "#7C3AED",
          "purple-light": "#A78BFA",
          gold: "#FFD700",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
