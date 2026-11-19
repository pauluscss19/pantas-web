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
          bg: "#F8FAF7", // Clean, fresh off-white
          primary: "#006837", // Official Indonesian Puskesmas Emerald Green
          "primary-hover": "#00522B",
          "primary-light": "#0D8249",
          soft: "#E8F5E9", // Soft Puskesmas pastel green
          "soft-hover": "#D7EED9",
          dark: "#14261B", // Deep readable slate
          muted: "#4A6353", // Balanced secondary text
          border: "#CFE3D6", // Light green-tinted border
          // Puskesmas Karangawen I institutional accents
          purple: "#532488",
          "purple-hover": "#42186E",
          "purple-soft": "#F3E8FF",
          "purple-border": "#D8B4FE",
          yellow: "#F59E0B",
          // Status colors
          amber: "#D97706",
          "amber-bg": "#FEF3C7",
          "amber-border": "#FCD34D",
          red: "#DC2626",
          "red-bg": "#FEE2E2",
          "red-border": "#FCA5A5",
          blue: "#1E40AF",
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
