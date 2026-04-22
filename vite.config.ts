/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { viteEnvs } from "vite-envs";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";

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
        alias: {
            components: path.resolve(__dirname, "src/components"),
            hooks: path.resolve(__dirname, "src/hooks"),
            utils: path.resolve(__dirname, "src/utils"),
            types: path.resolve(__dirname, "src/types"),
            pages: path.resolve(__dirname, "src/pages"),
            models: path.resolve(__dirname, "src/models"),
            routes: path.resolve(__dirname, "src/routes"),
            themes: path.resolve(__dirname, "src/themes"),
            "todos-api": path.resolve(__dirname, "src/todos-api"),
            constantes: path.resolve(__dirname, "src/constantes"),
            assets: path.resolve(__dirname, "src/assets"),
            styles: path.resolve(__dirname, "src/styles"),
            store: path.resolve(__dirname, "src/store")
        }
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