/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter var"', "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eefbff",
          100: "#d7f5ff",
          200: "#b3ecff",
          300: "#7adeff",
            400: "#33cbff",
          500: "#06b2f0",
          600: "#008cc5",
          700: "#006f9d",
          800: "#065d81",
          900: "#0b4e6c",
          950: "#062f44"
        }
      }
    }
  },
  plugins: []
};