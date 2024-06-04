import {defineConfig} from 'vite';

export default defineConfig({
  envDir: '.',
  envPrefix: 'COHORT_',
  server: {
    port: 4244,
  },
});
