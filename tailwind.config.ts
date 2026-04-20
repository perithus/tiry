import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f7fb",
          100: "#eaf0f7",
          200: "#d6e0ee",
          300: "#b8c7dc",
          400: "#92a7c7",
          500: "#6e86af",
          600: "#566b92",
          700: "#445472",
          800: "#2d3850",
          900: "#161d2d"
        },
        teal: {
          50: "#ecfffb",
          100: "#cffff4",
          200: "#a0f8e9",
          300: "#69e7d8",
          400: "#35cdbd",
          500: "#18aa9d",
          600: "#11877f",
          700: "#106b66",
          800: "#115452",
          900: "#103f3f"
        },
        sand: "#f6f2eb"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(24,170,157,0.28), transparent 32%), radial-gradient(circle at 80% 20%, rgba(110,134,175,0.24), transparent 24%), linear-gradient(160deg, #101726 0%, #17243d 50%, #111827 100%)"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui"
        ]
      }
    }
  },
  plugins: [
    forms
  ]
};

export default config;
