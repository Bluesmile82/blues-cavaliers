const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      ...colors,
      gray: colors.zinc,
      'gray-100': '#E9FFF9',
      background: '#1D3354',
      'old-rose': '#A37774',
      'ucla-blue': '#467599',
      blue: colors.sky,
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-overpass)'],
        mono: ['var(--font-roboto-mono)'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
