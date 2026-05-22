const MENSCH_SAVE_KEY = 'omasMenschSpiel';
const MENSCH_LOG_LIMIT = 4;
const MENSCH_HUMAN = 'rot';
const MENSCH_BOT = 'blau';
const MENSCH_PATH = [
  [6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[10,6],[10,5],
  [10,4],[9,4],[8,4],[7,4],[6,4],[6,3],[6,2],[6,1],[6,0],[5,0],
  [4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,5],
  [0,6],[1,6],[2,6],[3,6],[4,6],[4,7],[4,8],[4,9],[4,10],[5,10]
];
const MENSCH_START_OFFSETS = { rot: 10, blau: 30 };
const MENSCH_YARDS = {
  rot: [[9,1],[10,1],[9,2],[10,2]],
  blau: [[0,8],[1,8],[0,9],[1,9]]
};
const MENSCH_HOME = {
  rot: [[9,5],[8,5],[7,5],[6,5]],
  blau: [[1,5],[2,5],[3,5],[4,5]]
};

let menschState = null;
let menschBotTimer = null;
let menschAnimating = false;

function initMenschPage() {
  const board = document.getElementById('mensch-board');
  const rollButton = document.getElementById('mensch-roll-button');
  const newGameButton = document.getElementById('mensch-new-game-button');
  if (!board || !rollButton || !newGameButton) return;

  rollButton.addEventListener('click', rollMenschDice);
  newGameButton.addEventListener('click', startNewMenschGame);

  window.cleanupOmasDynamicPage = function () {
    window.clearTimeout(menschBotTimer);
  };

  menschState = loadMenschState() || createNewMenschState();
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus();
  if (isMenschBotTurn()) scheduleMenschBotTurn();
}

window.initMenschPage = initMenschPage;
document.addEventListener('DOMContentLoaded', initMenschPage);

function createNewMenschState() {
  return {
    pieces: {
      rot: [0, -1, -1, -1],
      blau: [0, -1, -1, -1]
    },
    currentPlayer: MENSCH_HUMAN,
    dice: null,
    log: [],
    winner: null,
    botThinking: false
  };
}

function loadMenschState() {
  try {
    const state = JSON.parse(localStorage.getItem(MENSCH_SAVE_KEY));
    if (!state || !state.pieces) return null;
    state.botThinking = false;
    state.log = Array.isArray(state.log) ? state.log : [];
    if (state.pieces.rot?.every(steps => steps === -1) && state.pieces.blau?.every(steps => steps === -1)) {
      state.pieces.rot[0] = 0;
      state.pieces.blau[0] = 0;
    }
    menschAnimating = false;
    return state;
  } catch (error) {
    return null;
  }
}

function saveMenschState() {
  localStorage.setItem(MENSCH_SAVE_KEY, JSON.stringify(menschState));
}

function startNewMenschGame() {
  window.clearTimeout(menschBotTimer);
  menschState = createNewMenschState();
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus('Neues Spiel gestartet. Eine rote Figur steht schon draußen.');
}

function renderMenschBoard() {
  const board = document.getElementById('mensch-board');
  if (!board || !menschState) return;
  board.innerHTML = '';

  renderMenschFields(board);
  renderMenschPieces(board);
  updateMenschStats();
}

function renderMenschFields(board) {
  MENSCH_PATH.forEach((cell, index) => {
    addMenschField(board, cell, 'mensch-field-path', `Feld ${index + 1}`);
  });
  MENSCH_YARDS.rot.forEach(cell => addMenschField(board, cell, 'mensch-field-yard mensch-red-area', 'Rotes Haus'));
  MENSCH_YARDS.blau.forEach(cell => addMenschField(board, cell, 'mensch-field-yard mensch-blue-area', 'Blaues Haus'));
  MENSCH_HOME.rot.forEach(cell => addMenschField(board, cell, 'mensch-field-home mensch-red-area', 'Rotes Ziel'));
  MENSCH_HOME.blau.forEach(cell => addMenschField(board, cell, 'mensch-field-home mensch-blue-area', 'Blaues Ziel'));
}

function addMenschField(board, [row, col], className, label) {
  const field = document.createElement('div');
  field.className = `mensch-field ${className}`;
  field.style.gridRow = row + 1;
  field.style.gridColumn = col + 1;
  field.setAttribute('aria-label', label);
  board.appendChild(field);
}

function renderMenschPieces(board) {
  [MENSCH_HUMAN, MENSCH_BOT].forEach(player => {
    menschState.pieces[player].forEach((steps, index) => {
      const cell = getMenschPieceCell(player, index);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `mensch-piece mensch-piece-${player}`;
      button.textContent = player === MENSCH_HUMAN ? 'R' : 'B';
      button.style.gridRow = cell[0] + 1;
      button.style.gridColumn = cell[1] + 1;
      button.disabled = player !== MENSCH_HUMAN || isMenschBusy() || !isMenschMoveLegal(player, index);
      if (isMenschMoveLegal(player, index)) button.classList.add('mensch-piece-movable');
      button.setAttribute('aria-label', `${player === MENSCH_HUMAN ? 'Rote' : 'Blaue'} Figur ${index + 1}`);
      button.addEventListener('click', () => handleMenschPieceClick(index));
      board.appendChild(button);
    });
  });
}

function rollMenschDice() {
  if (menschState.winner || isMenschBusy() || menschState.dice) return;
  menschState.dice = Math.floor(Math.random() * 6) + 1;
  saveMenschState();
  renderMenschBoard();

  if (!getLegalMenschMoves(MENSCH_HUMAN).length) {
    updateMenschStatus(`Du hast eine ${menschState.dice} gewürfelt. Leider kein Zug möglich.`);
    window.setTimeout(finishMenschHumanTurn, 4500);
    return;
  }

  updateMenschStatus(`Du hast eine ${menschState.dice} gewürfelt. Wähle eine rote Figur.`);
}

async function handleMenschPieceClick(index) {
  if (menschAnimating) return;
  if (!isMenschMoveLegal(MENSCH_HUMAN, index)) {
    updateMenschStatus('Diese Figur kann gerade nicht ziehen.');
    return;
  }

  menschAnimating = true;
  renderMenschBoard();
  updateMenschStatus('Deine rote Figur bewegt sich langsam.');
  await animateMenschPieceMove(MENSCH_HUMAN, index);
  menschAnimating = false;
  moveMenschPiece(MENSCH_HUMAN, index);
  if (checkMenschWinner()) return;

  if (menschState.dice === 6) {
    menschState.dice = null;
    saveMenschState();
    renderMenschBoard();
    updateMenschStatus('Sechs! Du darfst noch einmal würfeln.');
    return;
  }

  finishMenschHumanTurn();
}

function finishMenschHumanTurn() {
  menschState.currentPlayer = MENSCH_BOT;
  menschState.dice = null;
  menschState.botThinking = true;
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus('Der Computer ist dran.');
  scheduleMenschBotTurn();
}

function scheduleMenschBotTurn() {
  window.clearTimeout(menschBotTimer);
  menschBotTimer = window.setTimeout(playMenschBotTurn, 2600);
}

async function playMenschBotTurn() {
  if (!isMenschBotTurn() || menschState.winner) return;

  menschState.dice = Math.floor(Math.random() * 6) + 1;
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus(`Der Computer würfelt eine ${menschState.dice}.`);
  await waitMensch(2200);

  const move = chooseMenschBotMove();
  if (!move) {
    menschState.currentPlayer = MENSCH_HUMAN;
    menschState.dice = null;
    menschState.botThinking = false;
    saveMenschState();
    renderMenschBoard();
    updateMenschStatus('Der Computer kann nicht ziehen. Du bist dran.');
    return;
  }

  updateMenschStatus('Der Computer hebt eine blaue Figur an.');
  await waitMensch(1600);
  await animateMenschPieceMove(MENSCH_BOT, move.index);
  moveMenschPiece(MENSCH_BOT, move.index);
  if (checkMenschWinner()) return;

  if (menschState.dice === 6) {
    saveMenschState();
    renderMenschBoard();
    updateMenschStatus('Der Computer hat eine Sechs und würfelt noch einmal.');
    scheduleMenschBotTurn();
    return;
  }

  menschState.currentPlayer = MENSCH_HUMAN;
  menschState.dice = null;
  menschState.botThinking = false;
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus('Du bist dran.');
}

function chooseMenschBotMove() {
  const moves = getLegalMenschMoves(MENSCH_BOT);
  if (!moves.length) return null;
  moves.sort((a, b) => scoreMenschMove(MENSCH_BOT, b.index) - scoreMenschMove(MENSCH_BOT, a.index));
  return moves[0];
}

function scoreMenschMove(player, index) {
  const current = menschState.pieces[player][index];
  const target = getMenschTargetSteps(current);
  let score = target;
  if (current === -1 && menschState.dice === 6) score += 20;
  const hit = getMenschOpponentAtTarget(player, target);
  if (hit) score += 30;
  if (target === 44) score += 15;
  return score;
}

function moveMenschPiece(player, index) {
  const current = menschState.pieces[player][index];
  const target = getMenschTargetSteps(current);
  const opponent = getMenschOpponentAtTarget(player, target);
  if (opponent) {
    menschState.pieces[opponent.player][opponent.index] = -1;
  }
  menschState.pieces[player][index] = target;
  saveMenschState();
  renderMenschBoard();
}

function getLegalMenschMoves(player) {
  return menschState.pieces[player]
    .map((steps, index) => ({ index, steps }))
    .filter(piece => isMenschMoveLegal(player, piece.index));
}

function isMenschMoveLegal(player, index) {
  if (!menschState.dice || menschState.winner) return false;
  const current = menschState.pieces[player][index];
  if (current === 44) return false;
  if (current === -1 && menschState.dice !== 6) return false;
  const target = getMenschTargetSteps(current);
  if (target > 44) return false;
  return !isMenschOwnPieceAt(player, target);
}

function getMenschTargetSteps(current) {
  if (current === -1) return 0;
  return current + menschState.dice;
}

function getMenschPieceCell(player, index) {
  const steps = menschState.pieces[player][index];
  if (steps === -1) return MENSCH_YARDS[player][index];
  if (steps >= 40) return MENSCH_HOME[player][Math.min(3, steps - 40)];
  return getMenschTrackCell(player, steps);
}

function getMenschTrackCell(player, steps) {
  const absoluteIndex = (MENSCH_START_OFFSETS[player] + steps) % MENSCH_PATH.length;
  return MENSCH_PATH[absoluteIndex];
}

function isMenschOwnPieceAt(player, targetSteps) {
  return menschState.pieces[player].some(steps => steps === targetSteps && steps !== -1 && steps !== 44);
}

function getMenschOpponentAtTarget(player, targetSteps) {
  if (targetSteps < 0 || targetSteps >= 40) return null;
  const opponent = player === MENSCH_HUMAN ? MENSCH_BOT : MENSCH_HUMAN;
  const targetCell = getMenschTrackCell(player, targetSteps);
  return menschState.pieces[opponent].map((steps, index) => ({ steps, index })).find(piece => {
    if (piece.steps < 0 || piece.steps >= 40) return false;
    const cell = getMenschTrackCell(opponent, piece.steps);
    return cell[0] === targetCell[0] && cell[1] === targetCell[1];
  }) ? {
    player: opponent,
    index: menschState.pieces[opponent].map((steps, index) => ({ steps, index })).find(piece => {
      if (piece.steps < 0 || piece.steps >= 40) return false;
      const cell = getMenschTrackCell(opponent, piece.steps);
      return cell[0] === targetCell[0] && cell[1] === targetCell[1];
    }).index
  } : null;
}

function checkMenschWinner() {
  if (menschState.pieces.rot.every(steps => steps === 44)) menschState.winner = MENSCH_HUMAN;
  if (menschState.pieces.blau.every(steps => steps === 44)) menschState.winner = MENSCH_BOT;
  if (!menschState.winner) return false;
  menschState.botThinking = false;
  saveMenschState();
  renderMenschBoard();
  updateMenschStatus(menschState.winner === MENSCH_HUMAN ? 'Du hast gewonnen!' : 'Der Computer hat gewonnen.');
  return true;
}

async function animateMenschPieceMove(player, index) {
  const board = document.getElementById('mensch-board');
  if (!board) {
    await waitMensch(1200);
    return;
  }
  const cells = getMenschAnimationCells(player, index);
  if (cells.length < 2) {
    await waitMensch(800);
    return;
  }

  const fromRect = getMenschCellRect(board, cells[0]);
  const floating = document.createElement('div');
  const sourcePiece = board.querySelector(`.mensch-piece-${player}[aria-label$="Figur ${index + 1}"]`);

  floating.className = `mensch-piece mensch-piece-${player} mensch-floating-piece`;
  floating.textContent = player === MENSCH_HUMAN ? 'R' : 'B';
  floating.style.left = `${fromRect.x}px`;
  floating.style.top = `${fromRect.y}px`;
  document.body.appendChild(floating);

  if (sourcePiece) {
    sourcePiece.classList.add('mensch-piece-picked-up');
  }

  await waitMensch(120);
  floating.classList.add('mensch-floating-piece-lifted');
  await waitMensch(360);

  for (const cell of cells.slice(1)) {
    const rect = getMenschCellRect(board, cell);
    floating.style.left = `${rect.x}px`;
    floating.style.top = `${rect.y}px`;
    await waitMensch(620);
  }

  floating.classList.remove('mensch-floating-piece-lifted');
  await waitMensch(360);
  floating.remove();

  if (sourcePiece) {
    sourcePiece.classList.remove('mensch-piece-picked-up');
  }
}

function getMenschAnimationCells(player, index) {
  const current = menschState.pieces[player][index];
  const target = getMenschTargetSteps(current);
  const cells = [getMenschPieceCell(player, index)];

  for (let step = Math.max(0, current + 1); step <= Math.min(39, target); step++) {
    cells.push(getMenschTrackCell(player, step));
  }

  for (let step = Math.max(40, current + 1); step <= Math.min(44, target); step++) {
    cells.push(MENSCH_HOME[player][Math.min(3, step - 40)]);
  }

  return cells;
}

function getMenschCellRect(board, [row, col]) {
  const rect = board.getBoundingClientRect();
  const cellWidth = rect.width / 11;
  const cellHeight = rect.height / 11;
  return {
    x: rect.left + col * cellWidth + cellWidth / 2,
    y: rect.top + row * cellHeight + cellHeight / 2
  };
}

function waitMensch(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

function isMenschBotTurn() {
  return menschState?.currentPlayer === MENSCH_BOT || menschState?.botThinking;
}

function isMenschBusy() {
  return isMenschBotTurn() || menschAnimating;
}

function updateMenschStats() {
  const dice = document.getElementById('mensch-dice');
  const humanHome = document.getElementById('mensch-human-home');
  const botHome = document.getElementById('mensch-bot-home');
  const rollButton = document.getElementById('mensch-roll-button');
  if (dice) dice.textContent = menschState.dice || '-';
  if (humanHome) humanHome.textContent = String(menschState.pieces.rot.filter(steps => steps === 44).length);
  if (botHome) botHome.textContent = String(menschState.pieces.blau.filter(steps => steps === 44).length);
  if (rollButton) rollButton.disabled = isMenschBusy() || Boolean(menschState.dice) || Boolean(menschState.winner);
}

function updateMenschStatus(message) {
  const status = document.getElementById('mensch-status');
  const log = document.getElementById('mensch-log');
  if (!status) return;
  const text = message || (isMenschBotTurn() ? 'Der Computer ist dran.' : 'Bitte würfeln.');
  status.textContent = text;

  if (menschState && message) {
    menschState.log = [text, ...(menschState.log || []).filter(item => item !== text)].slice(0, MENSCH_LOG_LIMIT);
    saveMenschState();
  }

  if (log && menschState) {
    log.innerHTML = '';
    (menschState.log || []).forEach(item => {
      const entry = document.createElement('p');
      entry.textContent = item;
      log.appendChild(entry);
    });
  }
}
