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
        "profile-gradient":
          "linear-gradient(0deg, rgba(236, 241, 245, 0.90) 0%, rgba(236, 241, 245, 0.20) 108.91%)",
        "not-found": "url('/images/bg-image-404.png')",
        dashboard: "url('/images/bg-image-dashboard.png')",
        "dashboard-circle": "url('/images/partos-circle-graphic-white.png')",
        "dashboard-header-gradient":
          "linear-gradient(91deg, #FFC20E 35.98%, #00A392 110.43%)",
        "dashboard-session": "linear-gradient(90deg, #FCFAF5 50%, #ffffff 50%)",
        "landing-circle":
          "url('/images/partos-circle-graphic-white-landing.png')",
        "landing-gradient":
          "linear-gradient(348deg, rgba(236, 241, 245, 0.50) 12.79%, #FFD249 95.83%)",
      },
      fontWeight: {
        "extra-light": "200",
        light: "300",
        normal: "400",
        medium: "400",
        semibold: "500",
        bold: "600",
        "extra-bold": "700",
      },
      maxWidth: {
        "8xl": "90rem",
        "9xl": "120rem",
        "10xl": "150rem",
      },
      height: {
        33: "8.25rem",
      },
    },
    colors: {
      light: {
        1: "#FFFFFF",
        2: "#F2F2F2",
        3: "#E5E5E5",
        4: "#D9D9D9",
        5: "#CBCBCB",
        6: "#BEBEBE",
        7: "#B1B1B1",
        8: "#A4A4A4",
        9: "#979797",
        10: "#8A8A8A",
      },
      dark: {
        1: "#999999",
        2: "#8B8B8B",
        3: "#777777",
        4: "#666666",
        5: "#555555",
        6: "#444444",
        7: "#3C3C3C",
        8: "#222222",
        9: "#111111",
        10: "#1e1e1e",
      },
      ["light-grey"]: {
        4: "#FCFAF5",
        5: "#FBF9F3",
        7: "#E1E0DA",
        8: "#EAE2C9",
      },
      blue: "#0089D7",
      grey: {
        100: "#ECF1F5",
        600: "#475467",
        800: "#899FA8",
        900: "#101828",
      },
      primary: {
        hover: "#FFDE7B",
        normal: "#FFD249",
        active: "#FFC20E",
        dark: "#FF9C00",
        menu: "#FFF7E5",
      },
      green: {
        active: "#d4e7e3",
        bold: "#00A392",
      },
      score: {
        1: "#FDEDBB",
        2: "#FFDE7B",
        3: "#FBBB04",
        4: "#D3A107",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem", // 640px
        md: "3rem", // 768px
        lg: "4rem", // 1024px
        xl: "4rem", // 1280px
      },
    },
  },
  plugins: [],
};
