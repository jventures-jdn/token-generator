import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: true,
  dts: true,
  format: ['esm', 'cjs'],
});
