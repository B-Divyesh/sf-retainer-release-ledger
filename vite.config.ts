import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
