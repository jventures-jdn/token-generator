/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  daisyui: {
    themes: [
      {
        jfinTheme: {
          primary: '#c92229',
          'primary-focus': '#ed000050',
          'primary-content': '#ffffff',
          secondary: '#3e33be',
          'base-300': '#0b0d0f',
          'base-200': '#16191d',
          'base-100': '#2e3338',
        },
      },
    ],
    darkTheme: 'jfinTheme', // name of one of the included themes for dark mode
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  safelist: [
    {
      pattern: /tooltip-./,
    },
    {
      pattern: /input-./,
    },
    {
      pattern: /range-./,
    },
  ],
};
