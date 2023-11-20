import { defineConfig } from 'cypress';

export default defineConfig({
  env: {
    API_URL: 'https://backend-server-test.plymouth.network',
  },
  e2e: {
    experimentalStudio: true,
  },
  // Disable chromeWebSecurity to allow Stripe Elements to work
  chromeWebSecurity: false,
});
