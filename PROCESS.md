# Process overview

## What I built

**Orchard Match**, a tile-matching game inspired by Sheep a Sheep: tap an exposed tile into a shared tray, three of a kind clears, and a full tray with no triple ends the game. There are no instructions: covered tiles are visibly muted and unavailable, while exposed tiles invite the first move.

## The moments that mattered

1. **An existing game gave me a target before I wrote any code.** Rather than guess what "obvious in ten seconds, one mechanic, done in five minutes" should look like, I picked 羊了个羊 (Sheep a Sheep) and checked whether a scaled-down version actually satisfies the crit brief's own wording, instead of trusting my memory of the game. That turned a vague reference into a concrete sample to build toward.
   [`6d6187f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/6d6187fb170a92d6ed39a2a21dbac7af5e607dc4)

2. **The first build's covering wasn't legible.** Covered tiles read as only a faint opacity dip, so a stranger couldn't tell a blocked tile from a tappable one without trying it first. Playing the build is what surfaced this, not reading the CSS, so I widened the covered/uncovered contrast until a blocked tile was unmistakable at a glance, then replayed to confirm the fix changed what I actually saw.
   [`5aba506`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/5aba50675724190bb76105948ea6b993f55ef11c)

3. **Playing a finished round showed the game was too easy.** I added two tile kinds and shrank the tray, but the kinds alone created a 0% naive-win-rate pigeonhole — seven kinds, six slots — caught by a throwaway bot before it shipped. Raising capacity fixed the rate but gave up the tight loss-risk the tray was meant to have, so I reverted it and fixed the same problem in the tile arrangement instead: the one layer that's ever exposed all at once now concentrates on three of the seven kinds, recovering a non-zero win rate on six slots without that trade-off.
   [`053daa3`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/053daa34d549df34d3b0aec1dac6abf81293abe1), [`839d04e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-Alisonsun7/commit/839d04e5a956ef4f27a5a4867b533d1c495ae1d1)
