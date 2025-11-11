/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#34267E",
          secondary: "#FF0084",
          background: "#F5F5FA",
          surface: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ["Verdana", "Geneva", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 45px rgba(52, 38, 126, 0.15)"
      }
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        lg: "1024px",
        xl: "1180px"
      }
    }
  },
  plugins: []
};

