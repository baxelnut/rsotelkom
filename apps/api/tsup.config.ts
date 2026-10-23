import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/vercel.ts" },
  outDir: "api",
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  noExternal: ["@rso/shared"],
});
