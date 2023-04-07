import path from "path";
import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";
import envCompatible from "vite-plugin-env-compatible";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: "",
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  plugins: [libInjectCss(), createVuePlugin(), viteCommonjs(), envCompatible()],
  server: {
    strictPort: false,
    https: false,
  },
  build: {
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "vuejs2-audio-recorder",
      fileName: "vuejs2-audio-recorder",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          vue: "Vue",
        },
      },
    },
  },
});
