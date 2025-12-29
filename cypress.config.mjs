import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      return config;
    },
  },
  hosts: { localhost: "0.0.0.0" },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
