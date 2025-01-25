/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#1a1b1e',
          800: '#2c2e33',
          700: '#373a40',
          600: '#5c5f66',
          400: '#868e96',
          200: '#ced4da',
        },
      },
    },
  },
  plugins: [],
};