import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { urbitPlugin } from '@urbit/vite-plugin-urbit';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    urbitPlugin({
      base: 'lexicon',
      target: 'http://localhost:8080/',
    }),
  ],
});