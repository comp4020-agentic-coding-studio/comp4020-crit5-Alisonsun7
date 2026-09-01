import { defineConfig } from "astro/config";

// Deployed under the GitHub Pages project-page path
// (comp4020-agentic-coding-studio.github.io/comp4020-crit5-Alisonsun7/), so
// every internal link and asset URL needs this base baked in — Astro (unlike
// the starter's Vite setup) has no relative-base shortcut.
export default defineConfig({
  // The origin, for the one place a relative URL is not good enough: Open Graph
  // requires an absolute `og:image`, and a scraper that doesn't resolve a
  // relative one just shows a link with no card. `base` covers everything the
  // browser resolves itself; this covers what other people's servers resolve.
  site: "https://comp4020-agentic-coding-studio.github.io",
  base: "/comp4020-crit5-Alisonsun7/",
  trailingSlash: "always",
});
