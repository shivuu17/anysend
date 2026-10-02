/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brutal: {
          yellow: '#FFE600',
          cyan: '#00F0FF',
          pink: '#FF6B99',
          lime: '#A3E635',
          purple: '#C084FC',
          orange: '#FF8A00',
          bg: '#FAF7F0',
          card: '#FFFFFF',
          dark: '#121212'
        }
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-white': '4px 4px 0px 0px #FFFFFF',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
