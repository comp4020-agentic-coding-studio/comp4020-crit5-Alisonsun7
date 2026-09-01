# COMP4020 prototype

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.

## The link-preview card

`public/card.png` (1200x630) is the image a shared link shows. On this Astro
setup, `src/layouts/BaseLayout.astro` resolves it to an absolute URL (Open
Graph needs one, unlike a browser-resolved relative link) and points the head
at it --- copy that resolution into any new layout. Nothing in CI checks the
image itself, so look at the deployed head when you add pages.

## The checks

`pnpm check` runs them (`pnpm check:evidence` is the extra gate before you
ship); CI runs the same plus links, secrets and the deploy. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## This file is yours

A starting point, not a rulebook. As you learn what your prototype needs --- a
convention the work has to hold to, a sensor that keeps catching you out (a
linter, say), a fact about the stack that is easy to get wrong --- write it down
here and wire it into `check`. Growing this file is the work.

## Facts about this stack that kept biting

Each of these cost a red check or a wrong conclusion once. Read them before
debugging the same thing again.

- **This repo runs Astro, not the starter's Vite.** `pnpm build` still emits the
  whole site into `dist/` and the `package.json` scripts keep their names, which
  is the entire CI contract --- but Astro has no relative-base shortcut, so the
  GitHub Pages project path must be baked in explicitly:
  `base: "/comp4020-crit5-Alisonsun7/"` in `astro.config.mjs`. Get it wrong and
  the site looks perfect locally while every asset 404s on the live URL. Commit
  the updated `pnpm-lock.yaml` too --- CI installs with `--frozen-lockfile`.
- **A link checker pointed at `dist/` is wrong once `base` is set.** Astro bakes
  the project path into every absolute URL, so crawling `dist/` as the server
  root looks for `dist/<base>/_astro/...` and reports every asset broken on a
  site that deploys perfectly. That reddened CI on a commit whose local
  `pnpm check` was green, because the check only existed in the workflow. Fixed
  by `scripts/check-links.mjs`, wired into `pnpm check`: it stages `dist` *under*
  the base so the crawl root matches the Pages origin. Two traps inside that —
  linkinator resolves its LOCATION glob **relative to `--server-root`**, not to
  the cwd, and without `--server-root` it roots the server at the crawled file's
  own directory and doubles the base. And staging alone proves nothing about
  whether the base is *correct*: stage and build read the same config, so they
  agree with each other while the live site 404s. I set the base to nonsense and
  watched the crawl still pass. The base is therefore asserted against the git
  remote's repo name — an independent source of truth is the whole point of the
  check.
- **A blocked `check` should not gate `deploy`.** Pages keeps serving the last
  successful deployment when a workflow run fails, so a gated deploy job doesn't
  take the site offline --- it silently freezes it at the last green commit while
  the repo moves on, and a bare HTTP 200 at the crit sweep reads as this week's
  work when it's last week's. The deploy job runs its own `pnpm build`, which is
  the gate that actually matters: a site that cannot build still cannot ship.
- **An `AudioContext` built before a user gesture is born suspended.** Build it
  lazily *inside* the first keydown or pointerdown handler, not at module load,
  or the first press only unlocks audio and makes no sound. Worth checking again
  on any prototype with sound: "where does the first sound come from" is often
  the first thing the pod judges.
- **`--headless` is the old headless mode and paints phantoms.** It drew a
  ~300×150 grey rectangle over the top-left of a canvas page, which reads
  exactly like a stale-canvas bug; I rewrote working code chasing it. Always
  pass `--headless=new`. If an artifact appears only in a screenshot, reproduce
  it in a real window before believing it.
- **Measure a canvas with a `ResizeObserver`, not a `resize` listener.** A
  `resize` listener measures once before layout has settled and then never
  again, so every frame draws into a stale box and the bug looks like bad
  rendering rather than bad measurement.
- **Headless Chrome on macOS will not give you a viewport narrower than
  ~500px.** `--window-size=390,N` produces a 390px-wide *image* of a ~500px-wide
  *layout*, cropped --- which looks exactly like horizontal overflow and is not.
  To check the 390×844 marking viewport for real, load the page in an
  `<iframe width="390">` inside a harness page and screenshot that; an iframe
  gets its own CSS viewport, so media queries evaluate correctly. Verify the
  harness itself with a media-query probe page before trusting a phone
  screenshot.
- **stylelint's `no-descending-specificity` dictates rule order,** and it is not
  negotiable by adding a comment. Selectors matching the same element must
  appear in ascending specificity. For links that means the order
  `a` → `nav a` → `a:visited` → `nav a:hover`, which reads oddly and is correct.
  When it complains, reorder; don't disable it.
- **`pnpm check` is `&&`-chained,** so a stylelint error stops vitest from
  running at all. A green test count after a lint failure is not a thing you
  have seen --- re-run after fixing the lint.
- **stylelint's `media-feature-range-notation` rejects `@media (min-width:
  900px)`.** Write range-context syntax instead: `@media (width >= 900px)`.
  Same for `max-width`.
