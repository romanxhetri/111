/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          100: '#FFF7ED',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
        green: {
          800: '#166534',
          900: '#14532d',
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(249, 115, 22, 0.4)',
      }
    }
  },
  plugins: [],
}
