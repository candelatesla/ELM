import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#153243",
        mist: "#F3F7F6",
        accent: "#2D7D7A",
        sand: "#F7E7CE",
        warn: "#C06C32",
      },
      boxShadow: {
        panel: "0 18px 40px rgba(21, 50, 67, 0.08)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
