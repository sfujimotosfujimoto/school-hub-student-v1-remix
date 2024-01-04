import { test, expect } from "@playwright/test"
const BASE_URL = "http://localhost:4000"
// // await page.getByRole('button', {name: "Google サインイン"}).click()
const authFile = "./data/storage.json"
// const BASE_URL = "http://localhost:4000"
// test("authenticate in example", async ({ page }) => {
//   await page.goto("http://localhost:4000/auth/signin")
//   await page.click(
//     "body > div > main > section > div.relative.flex.w-full.items-center.justify-center.gap-8 > form > button",
//   )
//   page.on("console", (msg) => console.log(msg.text()))
//   await page.waitForURL(
//     /^https:\/\/accounts\.google\.com\/v3\/signin\/.*/,
//     // /^https:\/\/accounts.google.com\/o\/oauth2\/v2\/auth\/.*/,
//   )
//   await page.pause()

//   await page.locator("#identifierId").fill("p9999999@seig-boys.jp")
//   console.log("✅ after page waitForURL", page.url())

//   await page.waitForURL(
//     /^https:\/\/accounts\.google\.com\/v3\/signin\/.*/,
//     // /^https:\/\/accounts.google.com\/o\/oauth2\/v2\/auth\/.*/,
//   )

//   await page.locator("#identifierNext button ").click()

//   await page.locator("#password  input").fill("seigseigseig")

//   await page.locator("#passwordNext  button ").click()
//   await page.pause()
//   await page.locator("#submit_approve_access  button").click()
//   console.log("✅ after login", page.url())
//   await page.waitForURL(new RegExp(`^${BASE_URL}/.*`))
//   await page.pause()

//   await page.context().storageState({ path: authFile })
// })

test.describe("Signin/Signout Flow", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4000")
  })

  test("Navigate Scenario for signin", async ({ page }) => {
    await page.pause()

    await page.click("main section div a")

    await page.waitForURL(new RegExp(`^${BASE_URL}/student/.*`))
    console.log("✅ after page waitForURL", page.url())

    const cardTitle = page
      .locator("div[data-name='student-card'] .card-title")
      .first()

    await expect(cardTitle).toContainText(RegExp(`^J3_F01_聖学院太郎`), {
      timeout: 10000,
    })
  })
})
