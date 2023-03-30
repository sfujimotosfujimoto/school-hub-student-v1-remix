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
          50: "#D5F0F1",
          100: "#AEE9EB",
          200: "#80CED1",
          300: "#78C3C6",
          400: "#70B3B5",
          500: "#639C9E",
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
      },
      gridTemplateColumns: {
        sidebar: "200px 1fr",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["winter"],
  },
}
