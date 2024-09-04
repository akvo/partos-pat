/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    maxWidth: {
      "8xl": "90rem",
      "9xl": "120rem",
      "10xl": "150rem",
    },
    colors: {
      light: {
        1: "#FFFFFF",
        2: "#F2F2F2",
        3: "#E5E5E5",
        4: "#D8D8D8",
        5: "#CBCBCB",
        6: "#BEBEBE",
        7: "#B1B1B1",
        8: "#A4A4A4",
        9: "#979797",
        10: "#8A8A8A",
      },
      dark: {
        1: "#999999",
        2: "#888888",
        3: "#777777",
        4: "#666666",
        5: "#555555",
        6: "#444444",
        7: "#333333",
        8: "#222222",
        9: "#111111",
        10: "#1e1e1e",
      },
      blue: "#0089D7",
      primary: {
        hover: "#FFDE7B",
        normal: "#FFD249",
        active: "#FFC20E",
        dark: "#FF9C00",
      },
    },
  },
  plugins: [],
};
