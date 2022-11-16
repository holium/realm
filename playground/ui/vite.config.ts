import path from 'path';
import { loadEnv, defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { urbitPlugin } from '@urbit/vite-plugin-urbit';

// https://vitejs.dev/config/
export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  const SHIP_URL =
    process.env.SHIP_URL ||
    process.env.VITE_SHIP_URL ||
    'http://localhost:8080';

  return defineConfig({
    server: {
      port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3010,
    },
    resolve: {
      alias: {
        react: path.resolve('../../node_modules/react'),
        '@types/react': path.resolve('../../node_modules/@types/react'),
      },
    },
    plugins: [
      urbitPlugin({ base: 'playground', target: SHIP_URL, secure: false }),
      reactRefresh(),
    ],
  });
};
