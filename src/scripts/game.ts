import {
  applyTap,
  generateBoard,
  isCovered,
  COLS,
  ROWS,
  LAYERS,
  type Board,
  type Tile,
  type TileKind,
} from "./game-logic";

const KINDS: TileKind[] = ["🍎", "🍋", "🍇", "🍊", "🍓", "🍉", "🍒"];
const KIND_NAMES: Record<TileKind, string> = {
  "🍎": "apple",
  "🍋": "lemon",
  "🍇": "grape",
  "🍊": "orange",
  "🍓": "strawberry",
  "🍉": "watermelon",
  "🍒": "cherries",
};
const COUNT_PER_KIND = 9;
const TRAY_CAPACITY = 9;

// Each layer sits a little further right and down than the one below it, so
// every tile straddles up to four tiles in the layer beneath it. Sizing the
// grid to (COLS + (LAYERS-1)*OFFSET_STEP) by the equivalent height keeps the
// topmost, most-offset layer inside the board instead of hanging off the
// right/bottom edge.
const OFFSET_STEP = 0.3;
const CELL_W = 100 / (COLS + (LAYERS - 1) * OFFSET_STEP);
const CELL_H = 100 / (ROWS + (LAYERS - 1) * OFFSET_STEP);
// Higher layers are drawn smaller, so a covered tile's corners stick out from
// underneath the ones stacked on top of it instead of being fully hidden.
const BOTTOM_SCALE = 0.97;
const TOP_SCALE = 0.8;
const CONFETTI_COLORS = ["#ffd76b", "#f76c6c", "#6ec6ff", "#8bd17c", "#ffffff"];

const boardEl = document.querySelector<HTMLDivElement>("#board");
const trayEl = document.querySelector<HTMLDivElement>("#tray");
const resultEl = document.querySelector<HTMLDivElement>("#result");
const resultIconEl = document.querySelector<HTMLParagraphElement>("#result-icon");
const resultTitleEl = document.querySelector<HTMLParagraphElement>("#result-title");
const resultTextEl = document.querySelector<HTMLParagraphElement>("#result-text");
const confettiEl = document.querySelector<HTMLDivElement>("#confetti");
const restartButton = document.querySelector<HTMLButtonElement>("#restart");

let board: Board;
let tray: TileKind[] = [];
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  // Built lazily, inside a tap handler, so it starts life already unlocked by
  // that same user gesture instead of being born suspended.
  audioCtx ??= new AudioContext();
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType, peakGain: number): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(peakGain, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Short high click: a tile landing in the tray. */
function playPlaceSound(): void {
  playTone(720, 0.12, "triangle", 0.15);
}

/** Low thud + a haptic buzz: three of a kind clearing out of the tray. */
function playClearSound(): void {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  navigator.vibrate?.(80);
}

function newGame(): void {
  board = generateBoard(KINDS, COUNT_PER_KIND);
  tray = [];
  resultEl?.setAttribute("hidden", "");
  resultEl?.classList.remove("win");
  if (confettiEl) confettiEl.innerHTML = "";
  renderTray();
  renderBoard();
}

function renderBoard(): void {
  if (!boardEl) return;
  boardEl.innerHTML = "";
  for (const tile of board.tiles) {
    if (tile.cleared) continue;
    const covered = isCovered(board, tile.id);

    const t = tile.layer / (LAYERS - 1);
    const scale = BOTTOM_SCALE + (TOP_SCALE - BOTTOM_SCALE) * t;
    const cellLeft = (tile.col + tile.layer * OFFSET_STEP) * CELL_W;
    const cellTop = (tile.row + tile.layer * OFFSET_STEP) * CELL_H;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `tile${covered ? " covered" : ""}`;
    button.textContent = tile.kind;
    button.setAttribute("aria-label", KIND_NAMES[tile.kind] ?? tile.kind);
    button.disabled = covered;
    button.style.zIndex = String(tile.layer + 1);
    button.style.left = `${cellLeft + (CELL_W * (1 - scale)) / 2}%`;
    button.style.top = `${cellTop + (CELL_H * (1 - scale)) / 2}%`;
    button.style.width = `${CELL_W * scale}%`;
    button.style.height = `${CELL_H * scale}%`;
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

function spawnConfetti(count = 28): void {
  if (!confettiEl) return;
  confettiEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]!;
    piece.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    confettiEl.appendChild(piece);
  }
}

function onTap(tile: Tile): void {
  if (tile.cleared || isCovered(board, tile.id)) return;
  tile.cleared = true;
  playPlaceSound();

  const outcome = applyTap(tray, tile.kind, TRAY_CAPACITY);
  tray = outcome.tray;
  renderTray();
  renderBoard();
  if (outcome.cleared) playClearSound();

  const boardCleared = board.tiles.every((t) => t.cleared);
  if (boardCleared) {
    showResult("win");
  } else if (outcome.gameOver) {
    showResult("loss");
  }
}

function showResult(kind: "win" | "loss"): void {
  if (!resultEl || !resultIconEl || !resultTitleEl || !resultTextEl) return;
  if (kind === "win") {
    resultIconEl.textContent = "";
    resultTitleEl.textContent = "WIN";
    resultTextEl.textContent = "Cleared!";
    resultEl.classList.add("win");
    spawnConfetti();
  } else {
    resultIconEl.textContent = "😭";
    resultTitleEl.textContent = "LOSE";
    resultTextEl.textContent = "No room left.";
    resultEl.classList.remove("win");
  }
  resultEl.removeAttribute("hidden");
}

restartButton?.addEventListener("click", newGame);
newGame();
