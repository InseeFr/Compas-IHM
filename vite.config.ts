/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteEnvs } from "vite-envs";
import reactSwc from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-vite-plugin";

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true
        }),
        reactSwc(),
        tsconfigPaths(),
        viteEnvs({
            declarationFile: ".env"
        })
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./vitest.setup.ts",
        coverage: {
            reporter: ["lcovonly"],
            reportsDirectory: "./coverage"
        },
        include: ["**/*.test.ts", "**/*.test.tsx"]
    }
});
