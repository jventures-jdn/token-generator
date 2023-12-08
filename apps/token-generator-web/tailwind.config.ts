const tailwindConfig = require('config-tailwind');
const config = {
  ...tailwindConfig,
  mode: 'jit',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
export default config;
