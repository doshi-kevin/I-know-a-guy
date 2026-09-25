// Real-wall-clock screenshot helper: launches installed Chrome via CDP,
// waits actual milliseconds (so requestAnimationFrame loops really run),
// and can click/type before capturing. Usage:
//   node scripts/shot.mjs out.png [waitMs] [url]
import puppeteer from "puppeteer-core";

const out = process.argv[2] || "shot.png";
const waitMs = parseInt(process.argv[3] || "3000", 10);
const url = process.argv[4] || "http://localhost:3131";
const actionsArg = process.argv[5]; // JSON array of {click: selector} | {wait: ms} | {type: [selector, text]}

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const fs = await import("fs");
const execPath = CHROME_PATHS.find((p) => fs.existsSync(p));

const browser = await puppeteer.launch({
  executablePath: execPath,
  headless: true,
  defaultViewport: { width: 1600, height: 900 },
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, waitMs));

if (actionsArg) {
  const actions = JSON.parse(actionsArg);
  for (const act of actions) {
    if (act.click) {
      await page.click(act.click);
    } else if (act.wait) {
      await new Promise((r) => setTimeout(r, act.wait));
    } else if (act.type) {
      const [sel, text] = act.type;
      await page.type(sel, text);
    } else if (act.eval) {
      await page.evaluate(act.eval);
    }
  }
}

await page.screenshot({ path: out, fullPage: false });
await browser.close();
console.log("Saved:", out);
console.log(logs.join("\n"));
