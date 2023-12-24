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
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        sfgreen: {
          50: "hsl(182, 80%, 85%)",
          100: "hsl(182, 75%, 80%)",
          200: "hsl(182, 70%, 75%)",
          300: "hsl(182, 65%, 70%)",
          400: "hsl(182, 60%, 65%)",
          500: "hsl(182, 55%, 60%)",
          600: "hsl(182, 50%, 55%)",
        },
        sfred: {
          50: "hsl(1, 80%, 85%)",
          100: "hsl(1, 75%, 80%)",
          200: "hsl(1, 70%, 75%)",
          300: "hsl(1, 65%, 70%)",
          400: "hsl(1, 60%, 65%)",
        },
        sfyellow: {
          50: "hsl(33, 80%, 85%)",
          100: "hsl(33, 75%, 80%)",
          200: "hsl(33, 70%, 75%)",
          300: "hsl(33, 65%, 70%)",
          400: "hsl(33, 60%, 65%)",
        },
        sfblue: {
          200: "hsl(215, 31%, 42%)",
          300: "hsl(215, 31%, 32%)",
          400: "hsl(215, 31%, 22%)",
          500: "hsl(215, 31%, 12%)",
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
  plugins: [require("tailwindcss-animate")],
}
