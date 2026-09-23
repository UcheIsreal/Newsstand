import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#141820",
        paper: "#f7f4ee",
        signal: "#e8473f",
        ocean: "#176b87",
        mint: "#cde8dd"
      }
    }
  },
  plugins: []
};

export default config;
