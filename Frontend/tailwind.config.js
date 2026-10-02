/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#15121F",
        panel: "#1D1829",
        fg: "#F2EFE9",
        accent: "#E8B04B",
        muted: "#9892A8",
        line: "#322B42",
      },
      fontFamily: {
        serif: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
