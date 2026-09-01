# Crit 5 — reflection

## The breakthrough

The breakthrough was learning to give the agent a target before asking it to build, instead of judging results after the fact. Before writing anything, I picked an existing game I already knew — the game named“sheep a sheep” — and asked Claude to check a scaled-down version against the crit's own wording. That gave me a concrete picture of "done" to compare every later output against, rather than trusting my gut when a build looked plausible.

That habit paid off again later. When testing turned up a 0% win rate, Claude's first fix — raising the tray back up — technically solved the number, but I recognised it also erased the tight loss-risk the tray was designed to have. Rather than accept a fix that passed the test but missed the point, I pushed back with a more specific instruction: solve the same problem the way the reference game does, by changing how tiles are arranged rather than how much room the tray has. Naming a mechanism, not just a symptom, is what got the agent to a fix that kept the original intent.

## What this changes

I want to be less of a spectator to what an agent proposes and more of an editor who checks a fix against the actual goal, not just whether a number moved. An AI can satisfy a metric while quietly abandoning the design decision behind it, and only I know what that decision was for. The habit I want to keep: hold a concrete reference or stated intent in mind before delegating a fix, so I notice when a technically-correct answer is still the wrong one, and can redirect with a specific alternative instead of vague dissatisfaction.
