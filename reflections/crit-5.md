# Crit 5 — reflection

## The breakthrough

The breakthrough wasn't a feature, it was building a way to check one.
Difficulty here is a claim — "harder, but still winnable" — that a single
playthrough can't verify; I can only ever prove one path through the board,
never that every path is fair. Writing two small, disposable scripts — a
naive greedy bot estimating a careless player's odds, and a backtracking
solver answering whether a careful player can always win — turned "does this
feel fair" into something I could actually measure. It paid off immediately:
adding two more tile kinds against the same 6-slot tray looked like a small
change, but the bot came back with a 0% win rate. Seven kinds can fill six
tray slots with no duplicate at all, a pigeonhole problem I would not have
spotted by eye. Rebalancing the tray and re-running both checks before
committing is the moment the game stopped being "probably fine" and became
something I could stand behind.

## What this changes

I want to stop trusting my own playtesting as proof a mechanic is balanced,
especially working alongside an agent that can make a change look plausible
without making it correct. A throwaway simulation is cheap next to shipping
something secretly unwinnable, and it's now my default whenever "balanced" or
"fair" is the actual claim, not just "does it render." The habit I want to
keep: find the smallest program that can falsify the claim, and run it before
the commit, not after a complaint.
