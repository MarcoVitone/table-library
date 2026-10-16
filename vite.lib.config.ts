import { readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const root = realpathSync(fileURLToPath(new URL(".", import.meta.url)));
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const external = Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies });

export default defineConfig({
  root,
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(root, "tsconfig.lib.json"),
      entryRoot: resolve(root, "src/tables-framework"),
      outDirs: [
        { dir: resolve(root, "dist"), moduleFormat: "esm" },
        { dir: resolve(root, "dist"), moduleFormat: "cjs" },
      ],
      afterDiagnostic(diagnostics) {
        if (diagnostics.some(diagnostic => diagnostic.category === 1)) {
          throw new Error("Cannot publish declarations with TypeScript errors.");
        }
      },
    }),
  ],
  resolve: { alias: { "@": resolve(root, "src") } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(root, "src/tables-framework/index.ts"),
      formats: ["es", "cjs"],
      fileName: format => format === "es" ? "index.js" : "index.cjs",
      cssFileName: "style",
    },
    rollupOptions: {
      external: id => external.some(name => id === name || id.startsWith(name + "/")),
    },
  },
});
