/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Josefin Sans", "Zen Kaku Gothic New", "sans-serif"],
    },
    extend: {
      colors: {
        sfgreen: {
          50: "hsl(182, 50%, 89%)",
          100: "hsl(182, 60%, 80%)",
          200: "hsl(182, 47%, 66%)",
          300: "hsl(182, 41%, 62%)",
          400: "hsl(182, 32%, 57%)",
          500: "hsl(182, 23%, 50%)",
        },
        sfred: {
          50: "hsl(1, 74%, 88%)",
          100: "hsla(1, 78%, 80%, 1)",
          200: "hsl(1, 64%, 72%)",
          300: "hsl(1, 54%, 66%)",
          400: "hsl(1, 58%, 66%)",
        },
        sfyellow: {
          50: "hsl(33, 50%, 91%)",
          100: "hsl(33, 59%, 84%)",
          200: "hsl(33, 67%, 79%)",
          300: "hsl(33, 66%, 72%)",
          400: "hsl(34, 69%, 66%)",
        },
        sfblue: {
          300: "hsl(215, 31%, 32%)",
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
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "hsl(182, 47%, 66%)",
          secondary: "hsl(1, 64%, 72%)",
          accent: "hsl(33, 67%, 79%)",
          neutral: "hsl(210, 50%, 99%)",
          "base-100": "hsl(210, 50%, 99%)",
          info: "hsl(182, 47%, 66%)",
          success: "hsl(182, 47%, 66%)",
          warning: "hsl(33, 67%, 79%)",
          error: "hsl(1, 64%, 72%)",
        },
      },
      "winter",
    ],
  },
}
