/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uabc: {
          green: '#00723F',
          gold: '#DD9718',
          dark: '#003B20',
        },
        clinical: {
          dark: '#1a1a1a',
          card: '#242424',
          text: '#e5e5e5',
          muted: '#a3a3a3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

