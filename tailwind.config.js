/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:  "#7B2D8B",   // Deep purple (brand color)
        secondary:"#D4A843",   // Gold accent
        dark:     "#2C1A3E",   // Dark purple
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
