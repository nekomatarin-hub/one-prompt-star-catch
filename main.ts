// Delivers this entry's POST.json to the grader's output directory.
//
// POST.json sits next to this file and holds the URL of the published
// X post for the make.fun "The agent builds a game from one prompt"
// bounty. The grader expects the file itself, byte for byte, so this
// program reads it once, sanity-checks the URL inside, and writes the
// untouched bytes to the destination.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "POST.json");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const destPath = join(outputDir, "POST.json");

// Keep the raw bytes for the copy; parse a text view only to validate.
const raw = readFileSync(sourcePath);
const post = JSON.parse(raw.toString("utf8")) as { url?: unknown };

if (typeof post.url !== "string" || !post.url.startsWith("https://x.com/")) {
  throw new Error(
    `POST.json must contain a "url" string starting with https://x.com/ (got: ${JSON.stringify(post.url)})`,
  );
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(destPath, raw);

// Read the copy back and compare, so a truncated or corrupted write can
// never pass silently — the grader grades exactly these bytes.
const written = readFileSync(destPath);
if (!written.equals(raw)) {
  throw new Error(
    `Copy verification failed: ${destPath} differs from ${sourcePath}`,
  );
}

console.log(
  `Delivered POST.json (${raw.length} bytes) to ${destPath} — post: ${post.url}`,
);
