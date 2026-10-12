/*
 * Where the browser tools find Chrome or Edge, and what this machine needs to start it.
 * Used by smoke-test.mjs, store-shots.mjs, lazy-players.mjs and measure-pictures.mjs.
 *
 * Looked for in this order: CHROME_PATH if it is set; Chrome or Edge where Windows and the
 * Mac put them; Chrome or Chromium on Linux; then the Chromium that Playwright keeps, which
 * is the only browser on the cloud machines Claude works on (/opt/pw-browsers there, or
 * wherever PLAYWRIGHT_BROWSERS_PATH says).
 */
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PLACES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];

// Playwright keeps each browser in a folder named for its build, "chromium-1194"; the
// newest is taken. Its headless-only shell ("chromium_headless_shell-...") is not a browser
// the game can be shown in, so it is passed over.
function playwrightChromium() {
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, '/opt/pw-browsers', join(homedir(), '.cache', 'ms-playwright')]) {
    if (!root || !existsSync(root)) continue;
    const builds = readdirSync(root).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => b.split('-')[1] - a.split('-')[1]);
    for (const b of builds) {
      const exe = ['chrome-linux/chrome', 'chrome-linux64/chrome'].map(p => join(root, b, p)).find(existsSync);
      if (exe) return exe;
    }
  }
  return null;
}

export function findBrowser() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  return PLACES.find(existsSync) || playwrightChromium();
}

// Chrome will not start its sandbox for the root user, which is who runs the cloud
// machines; there it must be told to go without. Anywhere else it keeps its sandbox.
export const MACHINE_FLAGS = process.getuid?.() === 0 ? ['--no-sandbox'] : [];
