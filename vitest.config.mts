/// <reference types='vitest' />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src"],
    },
    environment: "node",
    globals: true,
    include: ["./test/**/*.spec.ts"],
  },
});
