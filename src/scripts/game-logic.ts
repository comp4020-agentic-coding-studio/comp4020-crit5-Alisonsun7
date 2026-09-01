// Pure game state --- no DOM, no rendering. This is what spec/crit-5.test.ts
// exercises directly, and what game.ts wraps with rendering and click
// handling.

export type TileKind = string;

export interface Tile {
  id: number;
  kind: TileKind;
  layer: number;
  col: number;
  row: number;
  cleared: boolean;
}

export interface Board {
  tiles: Tile[];
  // tile id -> ids of the tiles one layer up that overlap it. The topmost
  // layer has nothing above it, so it never appears as a key here.
  covers: Map<number, number[]>;
}

export const COLS = 7;
export const ROWS = 3;
export const LAYERS = 3;

/** Fisher-Yates, using the given RNG so board layout is reproducible in tests. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * `layers` stacked copies of a COLS x ROWS grid, each offset a little further
 * right and down than the one below it, so every tile straddles up to four
 * tiles in the layer directly beneath it (pyramid-style, like the original
 * game's stacked cards). `kinds.length * countPerKind` must equal
 * `layers * COLS * ROWS` (one board's worth of tiles, split evenly across
 * layers).
 */
export function generateBoard(
  kinds: TileKind[],
  countPerKind: number,
  layers: number = LAYERS,
  rng: () => number = Math.random,
): Board {
  const total = kinds.length * countPerKind;
  const perLayer = COLS * ROWS;
  if (total !== perLayer * layers) {
    throw new Error(`generateBoard: ${total} tiles doesn't fill ${layers} ${perLayer}-cell layers`);
  }

  const bag = shuffle(
    kinds.flatMap((kind) => Array.from({ length: countPerKind }, () => kind)),
    rng,
  );

  const tiles: Tile[] = [];
  let nextId = 0;
  for (let layer = 0; layer < layers; layer++) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        tiles.push({ id: nextId, kind: bag[nextId]!, layer, col, row, cleared: false });
        nextId++;
      }
    }
  }

  const covers = new Map<number, number[]>();
  for (let layer = 0; layer < layers - 1; layer++) {
    const below = tiles.filter((t) => t.layer === layer);
    const above = tiles.filter((t) => t.layer === layer + 1);
    for (const b of below) {
      // A tile one layer up at (col, row) sits offset right and down, so it
      // overlaps the tiles at (col, row), (col+1, row), (col, row+1) and
      // (col+1, row+1) in the layer below it.
      const overlapping = above
        .filter((t) => (t.col === b.col || t.col === b.col - 1) && (t.row === b.row || t.row === b.row - 1))
        .map((t) => t.id);
      if (overlapping.length > 0) covers.set(b.id, overlapping);
    }
  }

  return { tiles, covers };
}

/** True if `tileId` still has an uncleared tile above it. The topmost layer
 *  is never covered --- nothing sits above it. */
export function isCovered(board: Board, tileId: number): boolean {
  const coveredBy = board.covers.get(tileId);
  if (!coveredBy) return false;
  const byId = new Map(board.tiles.map((t) => [t.id, t]));
  return coveredBy.some((id) => byId.get(id)?.cleared === false);
}

export interface TapResult {
  tray: TileKind[];
  cleared: boolean;
  gameOver: boolean;
}

/**
 * The one rule of the game: tapping a tile pushes its kind onto the tray.
 * Three of a kind in the tray clear together. Otherwise, once the tray is
 * full, the game is over --- there's no move left that doesn't overflow it.
 */
export function applyTap(tray: TileKind[], kind: TileKind, capacity: number): TapResult {
  const next = [...tray, kind];
  if (next.filter((k) => k === kind).length >= 3) {
    let removed = 0;
    const cleared = next.filter((k) => {
      if (k === kind && removed < 3) {
        removed++;
        return false;
      }
      return true;
    });
    return { tray: cleared, cleared: true, gameOver: false };
  }
  return { tray: next, cleared: false, gameOver: next.length >= capacity };
}
