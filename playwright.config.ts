import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 120000,

  expect: {
    timeout: 5000,
  },
  testDir: "./e2e",
  fullyParallel: true,
  workers: 4,
  reporter: "html",
  use: {
    baseURL: "https://staging-fe.mytwocents.io",
    trace: "on-first-retry",
    headless: false,
  },

  projects: [
    // Admin (Web Only)
    {
      name: "Admin - Chrome",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/e2e/tests/AdminTest/**"],
    },
    {
      name: "Admin - WebKit",
      use: { ...devices["Desktop Safari"] },
      testMatch: ["**/e2e/tests/AdminTest/**"],
    },
    {
      name: "Admin - Firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: ["**/e2e/tests/AdminTest/**"],
    },

    // Business & Patron for Web
    {
      name: "Business & Patron - Web",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/e2e/tests/BusinessTest/**", "**/e2e/tests/UserTest/**"],
    },
    // {
    //   name: "Business & Patron - Web",
    //   use: { ...devices["Desktop Safari"] },
    //   testMatch: ["**/e2e/tests/BusinessTest/**", "**/e2e/tests/UserTest/**"],
    // },
    // {
    //   name: "Business & Patron - Web",
    //   use: { ...devices["Desktop Firefox"] },
    //   testMatch: ["**/e2e/tests/BusinessTest/**", "**/e2e/tests/UserTest/**"],
    // },

    // //  Business & Patron for Mobile
    // {
    //   name: "Business & Patron - Mobile",
    //   use: { ...devices["iPhone 13"] },
    //   testMatch: ["**/e2e/tests/BusinessTest/**", "**/e2e/tests/UserTest/**"],
    // },
    {
      name: "Business & Patron - Pixel 5",
      use: { ...devices["Pixel 5"] },
      testMatch: ["**/e2e/tests/BusinessTest/**", "**/e2e/tests/UserTest/**"],
    },
  ],
});
