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
        cream: {
          50: "#FFFDFB",
          100: "#FDF8F5",
          200: "#FAF0EB",
        },
        blush: {
          50: "#FFF0F2",
          100: "#FFD6DF",
          200: "#FBC7D4",
          300: "#FFB3C1",
          400: "#FF8FAB",
        },
        rose: {
          gold: "#D4A373",
          "gold-light": "#E0A96D",
          "gold-pale": "#F5E6D3",
        },
        espresso: "#2D2424",
        "espresso-light": "#4A3B3B",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(251,199,212,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(251,199,212,0.7)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        blush: "0 0 40px rgba(251,199,212,0.3)",
        "blush-lg": "0 0 60px rgba(251,199,212,0.5)",
        "rose-gold": "0 0 30px rgba(212,163,115,0.3)",
        "card-soft": "0 8px 32px rgba(45,36,36,0.06)",
        "card-hover": "0 20px 60px rgba(45,36,36,0.12)",
      },
      backgroundImage: {
        "cream-gradient": "linear-gradient(135deg, #FFFDFB 0%, #FDF8F5 50%, #FFF0F2 100%)",
        "blush-gradient": "linear-gradient(135deg, #FFF0F2 0%, #FBC7D4 100%)",
        "rose-gold-gradient": "linear-gradient(135deg, #D4A373 0%, #E0A96D 50%, #F5E6D3 100%)",
        "hero-gradient": "radial-gradient(ellipse at 70% 50%, #FFF0F2 0%, #FFFDFB 60%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
