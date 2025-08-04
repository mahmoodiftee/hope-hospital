/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FE8C00",
        blue: {
          DEFAULT: '#007AFF',
          100: '#E0F2FF',
          200: '#BAE6FD',
        },
        green: {
          DEFAULT: '#43B75D',
          100: '#D1FAE5',
          200: '#A7F3D0',
        },
        red: {
          DEFAULT: '#EE443F',
          100: '#FECACA',
          200: '#F87171',
        },
        white: {
          DEFAULT: "#FFFFFF",
          100: "#FAFAFA",
        },
        gray: {
          100: "#878787",
          200: "#6B7280",
        },

        dark: {
          100: "#181C2E",
        },
        error: "#F14141",
        success: "#2F9B65",
      },
      fontFamily: {
        quicksand: ["Quicksand-Regular", "sans-serif"],
        "quicksand-bold": ["Quicksand-Bold", "sans-serif"],
        "quicksand-semibold": ["Quicksand-SemiBold", "sans-serif"],
        "quicksand-light": ["Quicksand-Light", "sans-serif"],
        "quicksand-medium": ["Quicksand-Medium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
