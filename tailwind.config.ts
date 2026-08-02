import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f4ede1",
        "paper-dark": "#ede3d3",
        ink: "#1f1a14",
        "ink-soft": "#5b5245",
        rust: "#b5502f",
        "rust-dark": "#8f3c22",
        line: "#ddd0ba",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "'Times New Roman'", "serif"],
        mono: ["'IBM Plex Mono'", "'SFMono-Regular'", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
