import type { Config } from "tailwindcss";

/**
 * Identidade visual do MusicOS
 * - ink:   fundos (estúdio escuro, próximo do preto azulado)
 * - brand: violeta elétrico (ações primárias, foco, links)
 * - pro:   dourado (tudo que é pago: selo PRO, planos, upgrade)
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080c",
          900: "#0b0d12",
          800: "#11141c",
          700: "#181c26",
          600: "#222837",
          500: "#2e3547",
        },
        brand: {
          50: "#f1efff",
          100: "#e4e0ff",
          200: "#c9c2ff",
          300: "#a99dff",
          400: "#8a79ff",
          500: "#6d5dfc",
          600: "#5a48e6",
          700: "#4838c2",
          800: "#372b96",
          900: "#271f6b",
        },
        pro: {
          100: "#fff3d6",
          200: "#ffe3a3",
          300: "#ffd06b",
          400: "#f5b942",
          500: "#e0a024",
          600: "#b87f14",
          700: "#8a5e0d",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(109,93,252,.35), 0 10px 40px -10px rgba(109,93,252,.45)",
        "glow-pro": "0 0 0 1px rgba(245,185,66,.4), 0 10px 40px -10px rgba(245,185,66,.5)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 8px 30px -12px rgba(0,0,0,.6)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up .25s ease-out both",
        "pop-in": "pop-in .2s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
