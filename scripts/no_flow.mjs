import puppeteer from "puppeteer-core";
const out = process.argv[2];
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, defaultViewport: { width: 1600, height: 900 }, args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[console] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto("http://localhost:3131", { waitUntil: "networkidle0" });
await sleep(300);
// switch to Patents niche + a distinct company to exercise a different branch
await page.click("[data-testid=practice-patent]");
await sleep(150);
await page.click("[data-testid=intake-next]");
await sleep(400);
await page.evaluate(() => {
  const input = document.querySelector('input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'Tern Robotics');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.click("[data-testid=intake-submit]");
await sleep(5200);
await page.screenshot({ path: out + "_1_results.png" });

await page.click("[data-testid=no-thanks-btn]");
await sleep(400);
await page.screenshot({ path: out + "_2_afterresults.png" });

await page.click("[data-testid=reason-chip]");
await sleep(1600);
await page.screenshot({ path: out + "_3_news.png" });

await page.click("[data-testid=no-tracking-done]");
await sleep(400);
await page.screenshot({ path: out + "_4_done.png" });

await browser.close();
console.log("DONE", logs.join(" | "));
