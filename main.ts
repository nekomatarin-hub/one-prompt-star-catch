// Entry for make.fun's "The agent builds a game from one prompt"
// (post-x-the-agent-builds-a-game-from-20261122-1709).
//
// The deliverable is a post on X: a short video of an AI agent building
// the STAR CATCH browser game from a single prompt, ending on the game
// itself. POST.json beside this file holds the post's URL, and this
// program's whole job is to hand those bytes to the grader: copy
// POST.json into the output directory (/output on the grader, or
// MAKEFUN_OUTPUT_DIR when run locally).

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./POST.json', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, join(outputDir, 'POST.json'));
