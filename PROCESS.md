# Process overview

## What I built

**Orchard Match**, a tile-matching game in the shape of 羊了个羊 (Sheep a
Sheep): tap a visible tile into a shared tray, three of a kind clears
together, and a full tray with no triple ends the game. One mechanic, no
instructions — the pyramid of stacked layers is its own affordance, since a
tile buried under others simply can't be tapped yet, and that's the whole
tutorial.

## The moments that mattered

1. **The one rule got a pure function before it got a DOM.** `applyTap` (tray
   push, clear-on-triple, game-over-on-full) lives in `game-logic.ts` with no
   DOM dependency, so `crit-5.test.ts` calls it directly instead of simulating
   clicks — the rule itself is under test, not the rendering around it.
   [`6d6187f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/6d6187fb170a92d6ed39a2a21dbac7af5e607dc4)

2. **Playing the first working build fixed what reading it couldn't.**
   Covering only read as a faint opacity dip, and a 7-slot tray left too much
   slack to ever realistically lose. I widened the covered/uncovered contrast
   and cut the tray to 6 slots, then replayed to confirm a covered tile is now
   unmistakable and losing is possible again.
   [`5aba506`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/5aba50675724190bb76105948ea6b993f55ef11c)

3. **"Harder" needed proof it was still fair, not a guess.** Adding layers,
   and later two more tile kinds, could each silently make the board
   unwinnable rather than just harder, and no single playthrough would show
   that. I wrote a throwaway greedy bot (a careless player's win rate) and a
   backtracking solver (can a careful player still always win) and ran both
   before accepting either change. The bot is what caught the second one:
   adding two kinds against the old 6-slot tray gave a 0% naive win rate — a
   pigeonhole problem, seven kinds into six slots. I recomputed the grid and
   tray capacity together instead of just appending two emoji, then re-ran
   both checks (60/500 naive wins, 30/30 solver-solvable) before committing.
   [`fbd6240`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/fbd62406d0cc099b7dc2d86470bece7b2d478508),
   [`053daa3`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/053daa34d549df34d3b0aec1dac6abf81293abe1)
