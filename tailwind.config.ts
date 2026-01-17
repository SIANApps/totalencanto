import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        roseGold: {
          50: "#fbf8f5",
          100: "#f7efe8",
          200: "#f1e3d7",
          300: "#e7c7ad",
          400: "#d6b08f",
          500: "#c8a27a",
          600: "#a88460"
        }
      }
    }
  },
  plugins: []
} satisfies Config;

