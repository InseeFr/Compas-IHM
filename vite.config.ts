/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { viteEnvs } from "vite-envs";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true
        }),
        react({
            babel: {
                plugins: ["babel-plugin-react-compiler"]
            }
        }),
        viteEnvs({
            declarationFile: ".env"
        })
    ],
    resolve: {
        tsconfigPaths: true,
    },
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