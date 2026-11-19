import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pantas: {
          bg: "#F7F8F3",
          primary: "#244B3B",
          "primary-hover": "#1D3C2F",
          soft: "#E7EEE7",
          dark: "#202923",
          muted: "#5B665E",
          border: "#D3DDD3",
          amber: "#D97706",
          "amber-bg": "#FEF3C7",
          "amber-border": "#FCD34D",
          red: "#DC2626",
          "red-bg": "#FEE2E2",
          "red-border": "#FCA5A5",
          blue: "#2563EB",
          "blue-bg": "#EFF6FF",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
