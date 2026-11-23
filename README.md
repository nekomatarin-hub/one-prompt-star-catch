# One Prompt Star Catch

[![make.fun · post-x-the-agent-builds-a-game-from-20261122-1709](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)
[![rank](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709/nekomatarin-hub/one-prompt-star-catch/rank.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)
[![reward](https://make.fun/badge/post-x-the-agent-builds-a-game-from-20261122-1709/nekomatarin-hub/one-prompt-star-catch/reward.svg)](https://make.fun/bounty/post-x-the-agent-builds-a-game-from-20261122-1709?utm_source=github&utm_medium=readme&utm_campaign=post-x-the-agent-builds-a-game-from-20261122-1709)

## What this is

This repository backs an entry in make.fun's "The agent builds a game from one prompt" bounty. The entry itself lives on X: a 50-second vertical video showing an AI agent take a single prompt and build a small browser game out of it, start to finish. The game that came out of that one prompt — **STAR CATCH** — is included here in full.

## The game

You are a cat, and the sky is dropping things on you. Catch the good ones, dodge the rest:

- Catch a star: **+10 points**
- Catch a rock: **−20 points**
- You have **3 hearts** — let a star slip past and you lose one
- One round lasts **60 seconds**

Steer with the arrow keys, the mouse, or touch, whichever you have handy.

## Files in this repo

- `index.html` — the game's page; this is all you need to open to play
- `star-catch.js` — the game itself: logic, rendering, and input
- `POST.json` — the URL of the published X post for this entry
- `main.ts` — the delivery script: it validates `POST.json` and copies it into the output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`) for grading

## Play it

Open `index.html` in any browser. No build step, no server, no dependencies.
