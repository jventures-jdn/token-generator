import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
  entry: ['src/**/*.ts', 'index.ts'],
  splitting: true,
  target: 'es5',
  treeshake: true,
  bundle: false,
});
