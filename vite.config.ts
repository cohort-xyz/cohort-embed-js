/// <reference types="vitest" />
import path from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  test: {
    environment: 'jsdom',
    reporters: ['verbose'],
    watch: false,
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts'],
      reporter: ['text'],
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'CohortSDK',
      fileName: format => `cohort-sdk.${format}.js`,
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    dts({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.project.json'),
      insertTypesEntry: true,
      logLevel: 'info',
      entryRoot: 'src',
      outDir: 'dist',
    }),
  ],
});
