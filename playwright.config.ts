import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  outputDir: ".e2e-results/artifacts",
  reporter: [["list"], ["json", { outputFile: ".e2e-results/results.json" }]],
  use: {
    baseURL: process.env.UI_TEST_URL || "http://localhost:3001",
    ...devices["Desktop Chrome"],
    screenshot: "only-on-failure",
    trace: "off",
  },
});
