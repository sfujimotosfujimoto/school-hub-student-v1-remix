/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Josefin Sans", "Zen Kaku Gothic New", "sans-serif"],
    },
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s linear infinite",
        wiggle: "wiggle 0.5s ease-in-out infinite",
      },
      colors: {
        sfgreen: {
          50: "hsl(182, 50%, 89%)",
          100: "hsl(182, 60%, 80%)",
          200: "hsl(182, 47%, 66%)",
          300: "hsl(182, 41%, 62%)",
          400: "hsl(182, 32%, 57%)",
          500: "hsl(182, 23%, 50%)",
          600: "hsl(222, 84%, 5%)",
        },
        sfred: {
          50: "#F7CBCA",
          100: "#F4A4A3",
          200: "#E58B8A",
          300: "#D77978",
          400: "#DB7A78",
        },
        sfyellow: {
          50: "#F4EADE",
          100: "#EED8BD",
          200: "#EDCDA5",
          300: "#E6BC87",
          400: "#E4B06E",
        },
        sfblue: {
          300: "hsl(215, 31%, 32%)",
        },
        sftext: {
          900: "hsl(215, 31%, 18%)",
        },
      },
      height: {
        screen: ["100vh", "100dvh"],
      },
      minHeight: {
        screen: ["100vh", "100dvh"],
      },
      maxHeight: {
        screen: ["100vh", "100dvh"],
      },
      gridTemplateColumns: {
        sidebar: "200px 1fr",
      },
      gridTemplateRows: {
        layout: "auto 1fr auto",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#76c3c6",

          secondary: "#e58b8a",

          accent: "#eed8b4",

          neutral: "#76c3c6",

          "base-100": "#ffffff",

          info: "#76c3c6",

          success: "#76c3c6",

          warning: "#eed8b4",

          error: "#e58b8a",
        },
      },
    ],
  },
}
