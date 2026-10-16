import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { fileURLToPath, URL } from "node:url";
import { realpathSync } from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  root: realpathSync(fileURLToPath(new URL(".", import.meta.url))),
  build: { outDir: "dist-demo" },
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
