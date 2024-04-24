import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  format: ['esm'],
  minify: false,
  bundle: true,
});
