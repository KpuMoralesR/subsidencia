/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4',
          100: '#fde6e9',
          200: '#fbd0d9',
          300: '#f7aab9',
          400: '#f27a93',
          500: '#e63f66',
          600: '#d11f4d',
          700: '#9f1c3b', // Guinda oficial aproximado
          800: '#691c32', // Guinda base (Sidebar)
          900: '#4b1225', // Guinda oscuro
        },
        secondary: {
          50: '#fbf8f2',
          100: '#f5efe0',
          200: '#ebdcb8',
          300: '#dec28a',
          400: '#cca25c',
          500: '#bc955c', // Dorado oficial
          600: '#9d7646',
          700: '#7d5a38',
          800: '#664933',
          900: '#543d2e',
        },
        sidebar: {
          DEFAULT: '#691c32',
          hover: '#85223e',
          active: '#9f2241',
        },
        accent: '#bc955c',
        unamBlue: '#003B5C',
        unamGold: '#F1C400',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
