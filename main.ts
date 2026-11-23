// Entry for make.fun's "The agent builds a game from one prompt"
// (post-x-the-agent-builds-a-game-from-20261122-1709).
//
// The deliverable is a post on X: a short video of an AI agent building
// the STAR CATCH browser game from a single prompt, ending on the game
// itself. POST.json beside this file holds the post's URL, and this
// program's whole job is to hand those bytes to the grader: copy
// POST.json into the output directory (/output on the grader, or
// MAKEFUN_OUTPUT_DIR when run locally).

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./POST.json', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail loudly rather than deliver a malformed entry: POST.json must
// parse and carry the post's URL before anything is copied.
const post = JSON.parse(readFileSync(source, 'utf8')) as { url?: unknown };
if (typeof post.url !== 'string' || !post.url.startsWith('https://x.com/')) {
  throw new Error('POST.json does not hold an X post URL yet');
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, join(outputDir, 'POST.json'));
console.log(`delivered ${post.url}`);
