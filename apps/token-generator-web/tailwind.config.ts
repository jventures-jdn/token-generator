const tailwindConfig = require('@jventures-jdn/config-tailwind');
const config = {
  ...tailwindConfig,
  mode: 'jit',
  theme: {
    ...tailwindConfig.theme,
    fontFamily: {
      notosans: 'var(--font-plex-sans-thai)',
      spacemono: 'var(--font-space-mono)',
    },
  },
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
export default config;
