// Crawl the built site for broken internal links, in the directory shape it is
// actually served in.
//
// This exists because crawling `dist/` directly does not work under Astro. The
// GitHub Pages project path is baked into every absolute URL Astro emits
// (`base` in astro.config.mjs), so a crawler rooted at `dist/` looks for
// `dist/<base>/_astro/...` and reports every asset as a 404 — while the live
// site is fine. The old CI step did exactly that and went red on a site that
// deploys correctly.
//
// So stage `dist` *under* the base path first. The crawl root then matches the
// Pages origin, and a base-prefixed absolute URL resolves here exactly as it
// does live.
//
// Staging alone cannot catch a base that is simply *wrong*, though: the stage is
// built from the same config the site was, so the two always agree with each
// other and the crawl passes while the live site 404s. Verified by setting the
// base to nonsense — the crawl still went green. Hence the assertion below,
// which compares the base against an independent source of truth: the name of
// the repository GitHub Pages actually serves this from.

import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import config from "../astro.config.mjs";

// Relative, not absolute: linkinator treats LOCATION as a glob once
// --server-root is given, and an absolute path through a directory with
// non-ASCII characters in it matches nothing.
const STAGE = ".link-check";
const base = (config.base ?? "/").replace(/^\/+|\/+$/g, "");

// A project Pages site is served at /<repo>/, so that is what `base` has to be.
// Taken from the remote rather than from any config, because the whole point is
// to disagree with the config when the config is wrong.
function servedPath() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY.split("/")[1];
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return url.replace(/\.git$/, "").split("/").pop();
  } catch {
    return null; // no remote to compare against; the crawl below still runs
  }
}

const served = servedPath();
if (served && base !== served) {
  console.error(
    `astro.config.mjs has base "/${base}/", but this deploys to /${served}/.\n` +
      `Every asset would 404 on the live URL while looking perfect locally.`,
  );
  process.exit(1);
}

rmSync(STAGE, { recursive: true, force: true });
const root = base ? join(STAGE, base) : STAGE;
mkdirSync(root, { recursive: true });
cpSync(resolve("dist"), root, { recursive: true });

// Internal links only. linkinator checks outbound links by default, so someone
// else's rate limiter or outage would redden a build with nothing wrong in it.
// The regex skips anything not on the local origin the site is served from;
// both spellings are named because a bare `--skip "^https?://"` matches that
// origin too and passes having scanned zero links.
// `--server-root` is what makes a base-prefixed absolute URL resolve the way it
// does on Pages: without it linkinator roots the server at the crawled file's
// own directory, so `/<base>/_astro/x.js` becomes `<base>/<base>/_astro/x.js`
// and every asset 404s. Note the glob is resolved *relative to* --server-root,
// not to the cwd — passing a stage-prefixed glob here matches nothing at all.
const result = spawnSync(
  "pnpm",
  [
    "dlx",
    "linkinator",
    base ? `${base}/**/*.html` : "**/*.html",
    "--server-root",
    STAGE,
    "--silent",
    "--skip",
    "^https?://(?!localhost|127)",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

rmSync(STAGE, { recursive: true, force: true });

if (result.status !== 0) {
  console.error(
    `\nlink check failed under base "/${base}/" — the crawl root above mirrors the deployed site,\n` +
      `so a 404 here is a 404 live. Check astro.config.mjs's base if every asset is missing.`,
  );
}
process.exit(result.status ?? 1);
