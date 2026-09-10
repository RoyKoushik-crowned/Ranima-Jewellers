import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171614",
        maroon: "#5B1E1E",
        gold: "#D4AF57",
        ivory: "#F6F1E7",
        sage: "#68705C",
        sand: "#E8DDCB"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        luxury: "0 24px 70px rgba(23,22,20,.14)"
      }
    }
  },
  plugins: []
};

export default config;