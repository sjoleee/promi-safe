import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["./src/index.ts"],
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  dts: true,
});
