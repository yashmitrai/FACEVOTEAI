/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eciBlue: '#7a1ae0ff',
        eciOrange: '#f39c12',
      }
    },
  },
  plugins: [],
}
