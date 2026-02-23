import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FF8C42", 
        primaryDark: "#E66A1B",
        secondary: "#FFD9C0",
        accent: "#4ECDC4", 
        background: "#FFF4EB", 
        surface: "#FFFFFF",
        text: "#2D3436",
        "text-muted": "#636E72",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Nunito", "sans-serif"], 
      },
      boxShadow: {
        'neostyle': '6px 6px 0px rgba(0,0,0,0.05), inset -2px -2px 0px rgba(0,0,0,0.02)',
        'neostyle-hover': '3px 3px 0px rgba(0,0,0,0.05), inset -2px -2px 0px rgba(0,0,0,0.02)',
        'neostyle-active': '0px 0px 0px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(0,0,0,0.05)',
        'floating': '0 10px 30px -10px rgba(255, 140, 66, 0.2)',
        'inner-depth': 'inset 3px 3px 8px rgba(0,0,0,0.06)',
        'card-depth': '0 4px 0 #E5E5E5',
        'button-depth': '0 4px 0 #E66A1B',
        'button-depth-secondary': '0 4px 0 #D1D5DB',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'pill': '9999px',
      }
    },
  },
  plugins: [forms, containerQueries],
}