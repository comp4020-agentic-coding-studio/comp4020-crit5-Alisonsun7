import { describe, expect, it } from "vitest";
import { applyTap } from "../src/scripts/game-logic";

// The one rule the spec asks for a focused automated test on: a tap adds a
// tile to the tray, three of a kind clear together, and a full tray with no
// completed triple ends the game.
describe("the tray rule", () => {
  it("clears three matching tiles from the tray", () => {
    const taps = ["🍎", "🍋", "🍎", "🍎"];
    let tray: string[] = [];
    let last;
    for (const kind of taps) {
      last = applyTap(tray, kind, 7);
      tray = last.tray;
    }

    expect(tray).toEqual(["🍋"]);
    expect(last?.cleared).toBe(true);
  });

  it("ends the game when the tray fills without completing a triple", () => {
    const kinds = ["🍎", "🍋", "🍇", "🍊", "🍓", "🍎", "🍋"];
    let tray: string[] = [];
    let last;
    for (const kind of kinds) {
      last = applyTap(tray, kind, 7);
      tray = last.tray;
    }

    expect(tray).toHaveLength(7);
    expect(last?.gameOver).toBe(true);
  });

  it("does not end the game while the tray still has room", () => {
    const result = applyTap(["🍎", "🍋"], "🍇", 7);
    expect(result.gameOver).toBe(false);
  });
});
