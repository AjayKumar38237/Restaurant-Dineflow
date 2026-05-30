import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { sourcemap: false, target: 'es2017', cssTarget: 'safari12' },
  server: { host: '0.0.0.0' }
});
