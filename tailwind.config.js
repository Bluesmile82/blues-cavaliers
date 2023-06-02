const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './page/**/*.{js,ts,jsx,tsx}',
    './ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      ...colors,
      gray: colors.zinc,
      'gray-1000': 'rgb(17,17,19)',
      'gray-1100': 'rgb(10,10,11)',
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
