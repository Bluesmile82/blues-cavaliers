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
      pink: '#FF0080',
      blue: '#0070F3',
      cyan: '#50E3C2',
      orange: '#F5A623',
      violet: '#7928CA',
    },
  },
};
