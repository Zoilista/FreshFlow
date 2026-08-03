import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',      // Emerald-500
          dark: '#059669',         // Emerald-600
          light: '#D1FAE5',        // Emerald-100
        },
        secondary: {
          DEFAULT: '#3B82F6',      // Blue-500
        },
      },
      borderRadius: {
        // Yuvarlak köşeler için varsayılanı rounded-xl seviyesine çekiyoruz
        DEFAULT: '0.75rem', 
      }
    },
  },
  plugins: [],
};

export default config;
