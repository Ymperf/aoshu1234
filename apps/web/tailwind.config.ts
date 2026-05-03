import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#165DFF",
        "primary-deep": "#0E42B3",
        "primary-soft": "#E8F1FF",
        ink: "#1D2939",
        muted: "#667085",
        line: "#DDE7F5"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(22, 93, 255, 0.08)",
        card: "0 14px 36px rgba(15, 23, 42, 0.06)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(22,93,255,0.12), rgba(22,93,255,0) 38%), linear-gradient(180deg, rgba(232,241,255,0.65), rgba(255,255,255,0.98))"
      }
    }
  },
  plugins: []
};

export default config;
