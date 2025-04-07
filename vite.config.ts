import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: "0.0.0.0", // Разрешает доступ по любому IP
    },
    esbuild: {
        legalComments: "none",
    },
    build: {
        target: "es2015",
        cssTarget: ["chrome70", "firefox63", "safari12", "edge79"],
        minify: "esbuild",
        modulePreload: false,
        rollupOptions: {
            input: {
                "service-worker": "src/service-worker.ts",
            },
            output: {
                format:"iife",
                entryFileNames: "[name].js",
            },
        },
    },
});
