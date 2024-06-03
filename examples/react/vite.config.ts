import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  envDir: '.',
  envPrefix: 'COHORT_',
  server: {
    port: 4243,
  },
  plugins: [react()],
});
