import { urbitPlugin } from '@urbit/vite-plugin-urbit';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }: any) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const SHIP_URL = 'http://127.0.0.1:8080';

  return defineConfig({
    server: {
      port: 3000,
    },
    plugins: [
      react(),
      urbitPlugin({ base: 'calendar', target: SHIP_URL, secure: true }),
    ],
  });
};
