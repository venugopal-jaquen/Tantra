/*
 * The floor under the tests (pre-launch safeguard 1, the founder's yes of 2026-10-17). An AI
 * asked to make a failing build pass can be tempted to weaken the tests instead (the research
 * in docs/ai-development-safeguards.md). So neither test may quietly shrink, and the smoke test
 * may not set aside more of its checks as "timed" ones (those a slow machine may excuse).
 *
 *   node tools/check-floor.mjs <smoke summary.json> [another summary.json ...]
 *
 * Each summary is the one tools/smoke-test.mjs writes into its output folder. The floors are
 * in tools/check-floor.json. A pull request that lowers one on purpose says so in its
 * description, on a line that starts "Checks weakened:", and the founder approves it; GitHub
 * passes the description in as PR_BODY. Exit code 0 = at or above every floor.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const floor = JSON.parse(readFileSync(join(REPO, 'tools', 'check-floor.json'), 'utf8'));
const said = /^\s*Checks weakened:/m.test(process.env.PR_BODY || '');
const low = [];

const summaries = process.argv.slice(2);
if (!summaries.length) { console.error('Give the smoke test summary or summaries to check.'); process.exit(2); }
for (const file of summaries) {
  const s = JSON.parse(readFileSync(file, 'utf8'));
  console.log(`smoke test (${file}): ${s.checks} checks, ${s.timed} of them timed; floor ${floor.smoke.checks}, at most ${floor.smoke.timed} timed`);
  if (s.checks < floor.smoke.checks) low.push(`the smoke test ran ${s.checks} checks, under its floor of ${floor.smoke.checks}`);
  if (s.timed > floor.smoke.timed) low.push(`the smoke test has ${s.timed} timed checks, over its ceiling of ${floor.smoke.timed}`);
  if (s.checks > floor.smoke.checks) console.log(`NOTE  ${s.checks - floor.smoke.checks} more checks than the floor: raise it in tools/check-floor.json`);
}

const game = spawnSync(process.execPath, [join(REPO, 'tools', 'check-game.mjs')], { encoding: 'utf8' });
const m = /(\d+)\/(\d+) checks passed/.exec(game.stdout || '');
const total = m ? +m[2] : 0;
console.log(`check-game: ${total} checks; floor ${floor.checkGame.checks}`);
if (total < floor.checkGame.checks) low.push(`check-game has ${total} checks, under its floor of ${floor.checkGame.checks}`);

if (!low.length) { console.log('PASS  every test is at or above its floor'); process.exit(0); }
for (const l of low) console.log((said ? 'ALLOWED ' : 'FAIL  ') + l);
if (said) { console.log('The pull request says "Checks weakened:", so this passes. The founder approves it before the merge.'); process.exit(0); }
console.log('A test may change only to follow a rule the founder changed. If that is what happened, say so in the pull request on a line starting "Checks weakened:".');
process.exit(1);
