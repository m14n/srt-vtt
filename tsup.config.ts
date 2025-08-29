// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',

  // Match package.json exports:
  // - CJS → dist/index.js
  // - ESM → dist/index.mjs
  format: ['esm', 'cjs'],
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.js' : '.mjs',
  }),

  // Types + clean single-file outputs
  dts: true,
  splitting: false,
  clean: true,

  // Build target & perf
  target: 'es2022',
  sourcemap: false,
  treeshake: true,
  minify: !opts.watch,
  platform: 'neutral',
}));
