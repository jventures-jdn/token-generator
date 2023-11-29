import type { Config } from 'tailwindcss';

const config: Config = {
  ...require('config-tailwind'),
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
};
export default config;
