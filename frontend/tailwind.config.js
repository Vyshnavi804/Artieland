/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        canvasSoft: "rgb(var(--color-canvas-soft) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        ultramarine: "rgb(var(--color-ultramarine) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)",
        cadmium: "rgb(var(--color-cadmium) / <alpha-value>)",
        alizarin: "rgb(var(--color-alizarin) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        blossom: "rgb(var(--color-blossom) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        "paint-gradient": "linear-gradient(135deg, #4C5FFF 0%, #8B3EF5 55%, #FF5C6C 100%)",
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(139, 62, 245, 0.35)",
      },
    },
  },
  plugins: [],
};
