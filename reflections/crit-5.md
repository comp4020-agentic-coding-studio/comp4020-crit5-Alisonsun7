# Crit 5 — reflection

## The breakthrough

The breakthrough wasn't a feature; it was building a way to challenge a claim about one.

Difficulty here is a claim — “harder, but still winnable” — and a single playthrough is weak evidence for it. One successful run only shows that one route through one board worked; it says little about how forgiving the game is overall. Writing two small, disposable scripts — a naive greedy bot estimating a careless player's chances, and a backtracking solver checking whether generated boards retained at least one winning path — turned “does this feel fair?” into something I could test.

It paid off immediately. Adding two more tile kinds while keeping the same 6-slot tray looked like a small change, but the bot returned a 0% win rate. The extra variety had made the existing tray capacity far more punishing than I expected. Rebalancing the board and tray together, then rerunning both checks before accepting the change, was the point where “probably fine” became a claim backed by evidence.

## What this changes

I want to stop treating my own playtesting as sufficient evidence that a mechanic is balanced, especially when working alongside an agent that can produce changes that look plausible without actually satisfying the design goal. Human playtesting is still useful for feel, clarity and frustration; simulation is better at challenging claims about repeated outcomes.

A throwaway checker is cheap compared with shipping something accidentally unwinnable. The habit I want to keep is simple: identify the claim I am about to trust, find the smallest program that could falsify it, and run that before I accept the change rather than after someone finds the problem.
