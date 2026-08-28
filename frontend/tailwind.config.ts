import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f4f8f3",
          100: "#e5efe3",
          500: "#6b9a68",
          600: "#518b51",
          700: "#3f6f40"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 42, 46, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
