import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    webExtension({
      manifest: 'manifest.json',
      browser: 'chrome', // or 'firefox'
    }),
  ],
  build: {
    outDir: 'dist',
  },
});