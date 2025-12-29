/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteEnvs } from "vite-envs";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        viteEnvs({
            declarationFile: ".env"
        }),
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true
        })
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./vitest.setup.ts"
    }
});
