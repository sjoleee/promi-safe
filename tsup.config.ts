import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["./src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  minify: true,
  dts: true,
});
