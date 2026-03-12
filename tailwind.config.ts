import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      backgroundColor: {
        cosmic: "#0f172a",
        "card-dark": "#1e293b",
      },
      textColor: {
        cosmic: "#f1f5f9",
      },
      borderColor: {
        cosmic: "#334155",
      },
      boxShadow: {
        glow: "0 0 20px rgba(96, 165, 250, 0.3)",
        "glow-indigo": "0 0 20px rgba(165, 180, 252, 0.3)",
      },
      borderRadius: {
        card: "var(--card-r)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
