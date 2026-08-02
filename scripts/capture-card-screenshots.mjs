#!/usr/bin/env node
/**
 * Capture card visibility demo screenshots at 390px viewport.
 * Usage: node scripts/capture-card-screenshots.mjs [before|after|all]
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = 3456;
const BASE = `http://127.0.0.1:${PORT}`;

const SHOTS = {
  before: [
    { url: "/dev/card-visibility/before", file: "card-visibility-before/demo.png" },
  ],
  after: [
    { url: "/dev/card-visibility", file: "card-visibility-after/demo.png" },
    { url: "/dev/card-visibility", file: "card-visibility-after/holdem-river.png", scroll: 120 },
    { url: "/dev/card-visibility", file: "card-visibility-after/plo.png", scroll: 280 },
    { url: "/dev/card-visibility", file: "card-visibility-after/blackjack.png", scroll: 420 },
    { url: "/dev/card-visibility", file: "card-visibility-after/board-reading.png", scroll: 560 },
    { url: "/dev/card-visibility", file: "card-visibility-after/my-hands-thumbnails.png", scroll: 720 },
    { url: "/dev/card-visibility", file: "card-visibility-after/card-picker.png", scroll: 860 },
  ],
};

async function waitForServer(ms = 30000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(`${BASE}/dev/card-visibility`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Dev server did not start in time");
}

async function capture(mode) {
  const puppeteer = await import("puppeteer").catch(() => null);
  if (!puppeteer) {
    console.log("puppeteer not installed — skipping automated screenshots");
    console.log("Demo pages available at /dev/card-visibility and /dev/card-visibility/before");
    return;
  }

  const shots = mode === "all" ? [...SHOTS.before, ...SHOTS.after] : SHOTS[mode] ?? [];
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  for (const shot of shots) {
    await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle0" });
    if (shot.scroll) await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
    const out = path.join(ROOT, "assets/screenshots", shot.file);
    await mkdir(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, fullPage: !shot.scroll });
    console.log("Saved", shot.file);
  }

  await browser.close();
}

const mode = process.argv[2] ?? "all";
const server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
  cwd: ROOT,
  stdio: "pipe",
  env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
});

try {
  await waitForServer();
  await capture(mode);
} finally {
  server.kill("SIGTERM");
}
