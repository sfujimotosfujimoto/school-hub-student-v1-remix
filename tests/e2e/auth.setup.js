import { test as setup } from "@playwright/test"

// await page.getByRole('button', {name: "Google サインイン"}).click()
const authFile = "./data/storage.json"
const BASE_URL = "http://localhost:4000"

setup("authenticate in example", async ({ page }) => {
  await page.goto("http://localhost:4000/auth/signin")
  await page.getByRole("button", { name: "Google サインイン" }).click()
  // await page.click("body > div > main > section > div > form > button")

  // const navigationPromise = page.waitForURL(
  //   /^https:\/\/accounts\.google\.com\/v3\/signin\/.*/,
  // )

  await page.locator("#identifierId").fill("p9999999@seig-boys.jp")
  await page.waitForURL(/^https:\/\/accounts\.google\.com\/v3\/signin\/.*/)
  await page.locator("#identifierNext").click()
  await page.waitForURL(
    /^https:\/\/accounts\.google\.com\/v3\/signin\/challenge\/.*/,
    { waitUntil: "load" },
  )
  // await page.getByText(/Next|次へ/).click()
  // let count = await page.getByRole("button", { name: "Next" }).count()
  // if (count > 0) {
  //   await page.getByRole("button", { name: "Next" }).click()
  // } else {
  //   await page.getByRole("button", { name: "次へ" }).click()
  // }

  // let regex = /^https:\/\/accounts\.google\.com\/v3\/signin\/challenge\/.*/
  // await page.waitForLoadState("networkidle")

  // await page.waitForSelector("input[name='Passwd']")
  // const navigationPromise2 = page.waitForURL(regex)
  // await passwordInput.fill("seigseigseig")
  await page.locator("input[name='Passwd']").fill("seigseigseig")
  await page.waitForURL(
    /^https:\/\/accounts\.google\.com\/v3\/signin\/challenge\/.*/,
  )
  // await navigationPromise2
  // await page.waitForURL(/challenge/, { waitUntil: "load" })

  // TODO:
  // I don't know why but when running `pnpm run test:e2e` it fails with
  // Error: : Timeout 30000ms exceeded.
  // Below is a workaround.
  // I checked the test fail png and when running `test:e2e`, it seemed that
  // the login page changed to Japanese version and the selector
  // `#passwordNext > div > button` was not found.
  // So I added a selector for Japanese version which gets the text "次へ" and
  // clicks it.
  // I first counted the number of elements with the selector
  // if it is 0, then I click the Japanese version selector.
  // await page.getByText(/Next|次へ/).click()
  await page.locator("#passwordNext").click()

  // count = await page.locator("#passwordNext > div > button").count()
  // if (count > 0) {
  //   await page.locator("#passwordNext > div > button").click()
  // } else {
  //   await page.getByRole("button", { name: "次へ" }).click()
  // }

  // await page.waitForURL(/^https:\/\/accounts\.google\.com\/.*/, {
  //   timeout: 30000,
  //   waitUntil: "load",
  // })
  // // const permitButton = page.locator(/Allow|許可/, {
  // //   has: (element) => {
  // //     return (
  // //       element.textContent() === "Allow" || element.textContent() === "許可"
  // //     )
  // //   },
  // // })
  await page.waitForURL(/^https:\/\/accounts\.google\.com\/.*/)
  await page.locator("#submit_approve_access").click()
  // await permitButton.click()
  // await (await page.getByRole("button").all()).at(0).click()
  // await page.getByText(/Allow|許可/).click()
  // let count = await page.getByRole("button", { name: "Allow" }).count()
  // if (count > 0) {
  //   await page.getByRole("button", { name: "Allow" }).click()
  // } else {
  //   await page.getByRole("button", { name: "許可" }).click()
  // }

  await page.context().storageState({ path: authFile })
})

/*
#passwordNext > div > button > span

*/
