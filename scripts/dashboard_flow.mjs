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
await page.click("[data-testid=intake-next]");
await sleep(500);
await page.click("[data-testid=intake-submit]");
await sleep(6300);
await page.click("[data-testid=introduce-btn]");
await sleep(400);
await page.click("[data-testid=approve-btn]");
await sleep(800);
await page.click("[data-testid=view-firm]");
await sleep(300);
await page.screenshot({ path: out + "_1_firm_after_send.png" });

await page.click("[data-testid=view-client]");
await sleep(300);
await sleep(3200); // let YesTracking's timeline play
await page.click("[data-testid=helped-btn]");
await sleep(500);
await page.click("[data-testid=view-firm]");
await sleep(300);
await page.screenshot({ path: out + "_2_firm_after_won.png" });

await browser.close();
console.log("DONE", logs.join(" | "));
