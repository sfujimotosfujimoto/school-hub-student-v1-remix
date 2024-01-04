import type { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
  timeout: 30000,
  retries: 0,
  testDir: "tests/e2e",
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30000,
    ignoreHTTPSErrors: true,
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.js/ },
    {
      name: "Chromium",
      use: {
        browserName: "chromium",
        storageState: "./data/storage.json",
        headless: true,
      },
      dependencies: ["setup"],
    },
    {
      name: "Firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "WebKit",
      use: { browserName: "webkit" },
    },
  ],
}

export default config
