import { applyTap, generateBoard, isCovered, COLS, ROWS, type Board, type Tile, type TileKind } from "./game-logic";

const KINDS: TileKind[] = ["🍎", "🍋", "🍇", "🍊", "🍓"];
const KIND_NAMES: Record<TileKind, string> = {
  "🍎": "apple",
  "🍋": "lemon",
  "🍇": "grape",
  "🍊": "orange",
  "🍓": "strawberry",
};
const COUNT_PER_KIND = 6;
const TRAY_CAPACITY = 7;

// Layer 1 tiles sit half a cell right and down from layer 0. Sizing the grid
// to (COLS + 0.5) by (ROWS + 0.5) cells keeps that shifted layer inside the
// board instead of hanging off the right/bottom edge.
const CELL_W = 100 / (COLS + 0.5);
const CELL_H = 100 / (ROWS + 0.5);
const TILE_SCALE = 0.92;

const boardEl = document.querySelector<HTMLDivElement>("#board");
const trayEl = document.querySelector<HTMLDivElement>("#tray");
const resultEl = document.querySelector<HTMLDivElement>("#result");
const resultTextEl = document.querySelector<HTMLParagraphElement>("#result-text");
const restartButton = document.querySelector<HTMLButtonElement>("#restart");

let board: Board;
let tray: TileKind[] = [];

function newGame(): void {
  board = generateBoard(KINDS, COUNT_PER_KIND);
  tray = [];
  resultEl?.setAttribute("hidden", "");
  renderTray();
  renderBoard();
}

function renderBoard(): void {
  if (!boardEl) return;
  boardEl.innerHTML = "";
  for (const tile of board.tiles) {
    if (tile.cleared) continue;
    const covered = isCovered(board, tile.id);

    const button = document.createElement("button");
    button.type = "button";
    button.className = `tile layer-${tile.layer}${covered ? " covered" : ""}`;
    button.textContent = tile.kind;
    button.setAttribute("aria-label", KIND_NAMES[tile.kind] ?? tile.kind);
    button.disabled = covered;
    button.style.left = `${(tile.layer === 1 ? tile.col + 0.5 : tile.col) * CELL_W}%`;
    button.style.top = `${(tile.layer === 1 ? tile.row + 0.5 : tile.row) * CELL_H}%`;
    button.style.width = `${CELL_W * TILE_SCALE}%`;
    button.style.height = `${CELL_H * TILE_SCALE}%`;
    button.addEventListener("click", () => onTap(tile));

    boardEl.appendChild(button);
  }
}

function renderTray(): void {
  if (!trayEl) return;
  const slots = trayEl.querySelectorAll<HTMLDivElement>(".tray-slot");
  slots.forEach((slot, i) => {
    const kind = tray[i];
    slot.textContent = kind ?? "";
    slot.classList.toggle("filled", Boolean(kind));
  });
}

function onTap(tile: Tile): void {
  if (tile.cleared || isCovered(board, tile.id)) return;
  tile.cleared = true;

  const outcome = applyTap(tray, tile.kind, TRAY_CAPACITY);
  tray = outcome.tray;
  renderTray();
  renderBoard();

  const boardCleared = board.tiles.every((t) => t.cleared);
  if (boardCleared) {
    showResult("Cleared!");
  } else if (outcome.gameOver) {
    showResult("No room left.");
  }
}

function showResult(message: string): void {
  if (!resultEl || !resultTextEl) return;
  resultTextEl.textContent = message;
  resultEl.removeAttribute("hidden");
}

restartButton?.addEventListener("click", newGame);
newGame();
