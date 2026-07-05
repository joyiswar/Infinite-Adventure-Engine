
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({
    tsconfig: 'tsconfig.json'
  })],
  build: {
    outDir: 'dist'
  },
  resolve: {
    mainFields: ['module'],
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://generativelanguage.googleapis.com; connect-src 'self' https://generativelanguage.googleapis.com https://esm.sh;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  }
});
