const DAME_SAVE_KEY = 'omasDameSpiel';
const DAME_HUMAN = 'rot';
const DAME_BOT = 'blau';
const DAME_SIZE = 8;

let dameState = null;
let selectedDamePieceId = null;
let dameBotTimer = null;

function initDamePage() {
  const board = document.getElementById('dame-board');
  const newGameButton = document.getElementById('dame-new-game-button');
  if (!board || !newGameButton) return;

  newGameButton.addEventListener('click', startNewDameGame);

  window.cleanupOmasDynamicPage = function () {
    window.clearTimeout(dameBotTimer);
  };

  dameState = loadDameState() || createNewDameState();
  saveDameState();
  renderDameBoard();
  updateDameStatus();

  if (isDameBotTurn()) {
    scheduleDameBotMove();
  }
}

window.initDamePage = initDamePage;
document.addEventListener('DOMContentLoaded', initDamePage);

function createNewDameState() {
  const pieces = {};
  let id = 0;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < DAME_SIZE; col++) {
      if (isDarkDameSquare(row, col)) {
        const pieceId = `b${id++}`;
        pieces[pieceId] = { id: pieceId, player: DAME_BOT, row, col, king: false };
      }
    }
  }

  id = 0;
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < DAME_SIZE; col++) {
      if (isDarkDameSquare(row, col)) {
        const pieceId = `r${id++}`;
        pieces[pieceId] = { id: pieceId, player: DAME_HUMAN, row, col, king: false };
      }
    }
  }

  return {
    pieces,
    currentPlayer: DAME_HUMAN,
    forcedPieceId: null,
    winner: null,
    botThinking: false
  };
}

function loadDameState() {
  try {
    const state = JSON.parse(localStorage.getItem(DAME_SAVE_KEY));
    if (!state || !state.pieces || !state.currentPlayer) return null;
    state.botThinking = false;
    return state;
  } catch (error) {
    return null;
  }
}

function saveDameState() {
  localStorage.setItem(DAME_SAVE_KEY, JSON.stringify(dameState));
}

function startNewDameGame() {
  window.clearTimeout(dameBotTimer);
  selectedDamePieceId = null;
  dameState = createNewDameState();
  saveDameState();
  renderDameBoard();
  updateDameStatus('Neues Spiel gestartet. Du bist dran.');
}

function renderDameBoard() {
  const board = document.getElementById('dame-board');
  if (!board || !dameState) return;

  board.innerHTML = '';
  for (let row = 0; row < DAME_SIZE; row++) {
    for (let col = 0; col < DAME_SIZE; col++) {
      const cell = document.createElement('button');
      const piece = getDamePieceAt(row, col);
      cell.type = 'button';
      cell.className = `dame-cell ${isDarkDameSquare(row, col) ? 'dame-cell-dark' : 'dame-cell-light'}`;
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.disabled = !isDarkDameSquare(row, col) || isDameBotTurn() || Boolean(dameState.winner);
      cell.setAttribute('aria-label', getDameCellLabel(row, col, piece));

      if (isDameLegalTarget(row, col)) {
        cell.classList.add('dame-target');
      }

      if (piece) {
        const pieceElement = document.createElement('span');
        pieceElement.className = `dame-piece dame-piece-${piece.player}`;
        pieceElement.textContent = piece.king ? 'D' : '';
        if (selectedDamePieceId === piece.id) {
          pieceElement.classList.add('selected');
        }
        cell.appendChild(pieceElement);
      }

      cell.addEventListener('click', () => handleDameCellClick(row, col));
      board.appendChild(cell);
    }
  }

  updateDameCounts();
}

function handleDameCellClick(row, col) {
  if (dameState.winner || isDameBotTurn()) return;

  const piece = getDamePieceAt(row, col);
  if (!selectedDamePieceId) {
    if (!piece || piece.player !== DAME_HUMAN) {
      updateDameStatus('Bitte eine rote Figur wählen.');
      return;
    }
    if (dameState.forcedPieceId && piece.id !== dameState.forcedPieceId) {
      updateDameStatus('Diese Figur muss weiter springen.');
      return;
    }
    selectedDamePieceId = piece.id;
    renderDameBoard();
    updateDameStatus('Figur gewählt. Klicke auf ein markiertes Feld.');
    return;
  }

  if (piece && piece.id === selectedDamePieceId) {
    selectedDamePieceId = null;
    renderDameBoard();
    updateDameStatus('Figur abgewählt.');
    return;
  }

  const selectedPiece = dameState.pieces[selectedDamePieceId];
  const move = getDameLegalMoves(selectedPiece, hasAnyDameCapture(DAME_HUMAN)).find(candidate => {
    return candidate.row === row && candidate.col === col;
  });

  if (!move) {
    selectedDamePieceId = null;
    renderDameBoard();
    updateDameStatus('Dieser Zug geht nicht.');
    return;
  }

  applyDameMove(selectedPiece, move);

  if (move.capture && getDameLegalMoves(selectedPiece, true).some(nextMove => nextMove.capture)) {
    dameState.forcedPieceId = selectedPiece.id;
    selectedDamePieceId = selectedPiece.id;
    saveDameState();
    renderDameBoard();
    updateDameStatus('Gut gesprungen. Diese Figur darf weiter springen.');
    return;
  }

  selectedDamePieceId = null;
  finishDameHumanTurn();
}

function finishDameHumanTurn() {
  dameState.forcedPieceId = null;
  if (checkDameWinner()) return;

  dameState.currentPlayer = DAME_BOT;
  dameState.botThinking = true;
  saveDameState();
  renderDameBoard();
  updateDameStatus('Der Computer denkt kurz.');
  scheduleDameBotMove();
}

function scheduleDameBotMove() {
  window.clearTimeout(dameBotTimer);
  dameBotTimer = window.setTimeout(playDameBotMove, 1100);
}

async function playDameBotMove() {
  if (!isDameBotTurn() || dameState.winner) return;

  let pieceAndMove = chooseDameBotMove();
  if (!pieceAndMove) {
    dameState.winner = DAME_HUMAN;
    dameState.botThinking = false;
    saveDameState();
    renderDameBoard();
    updateDameStatus('Du hast gewonnen!');
    return;
  }

  while (pieceAndMove) {
    const piece = dameState.pieces[pieceAndMove.pieceId];
    await animateDameBotMove(piece, pieceAndMove.move);
    applyDameMove(piece, pieceAndMove.move);
    saveDameState();
    renderDameBoard();

    if (!pieceAndMove.move.capture) break;
    await waitDame(450);

    const nextCaptures = getDameLegalMoves(piece, true).filter(move => move.capture);
    if (!nextCaptures.length) break;
    pieceAndMove = {
      pieceId: piece.id,
      move: pickBestDameBotMove(piece, nextCaptures)
    };
  }

  if (checkDameWinner()) return;
  dameState.currentPlayer = DAME_HUMAN;
  dameState.botThinking = false;
  saveDameState();
  renderDameBoard();
  updateDameStatus('Du bist dran.');
}

function animateDameBotMove(piece, move) {
  const board = document.getElementById('dame-board');
  if (!board) {
    return waitDame(1500);
  }

  const fromCell = board.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
  const toCell = board.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
  if (!fromCell || !toCell) {
    return waitDame(1500);
  }

  const fromRect = fromCell.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();
  const floatingPiece = document.createElement('div');
  const sourcePiece = fromCell.querySelector('.dame-piece');

  floatingPiece.className = `dame-piece dame-piece-${piece.player} dame-floating-piece`;
  floatingPiece.textContent = piece.king ? 'D' : '';
  floatingPiece.style.left = `${fromRect.left + fromRect.width / 2}px`;
  floatingPiece.style.top = `${fromRect.top + fromRect.height / 2}px`;
  document.body.appendChild(floatingPiece);

  if (sourcePiece) {
    sourcePiece.classList.add('dame-piece-picked-up');
  }

  return new Promise(resolve => {
    window.setTimeout(() => {
      floatingPiece.classList.add('dame-floating-piece-lifted');

      window.setTimeout(() => {
        floatingPiece.style.left = `${toRect.left + toRect.width / 2}px`;
        floatingPiece.style.top = `${toRect.top + toRect.height / 2}px`;

        window.setTimeout(() => {
          floatingPiece.classList.remove('dame-floating-piece-lifted');

          window.setTimeout(() => {
            floatingPiece.remove();
            if (sourcePiece) {
              sourcePiece.classList.remove('dame-piece-picked-up');
            }
            resolve();
          }, 350);
        }, 1450);
      }, 300);
    }, 80);
  });
}

function waitDame(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

function chooseDameBotMove() {
  const pieces = Object.values(dameState.pieces).filter(piece => piece.player === DAME_BOT);
  const mustCapture = hasAnyDameCapture(DAME_BOT);
  const options = [];
  pieces.forEach(piece => {
    getDameLegalMoves(piece, mustCapture).forEach(move => {
      options.push({ pieceId: piece.id, move, score: scoreDameMove(piece, move) });
    });
  });
  options.sort((a, b) => b.score - a.score);
  return options[0] || null;
}

function pickBestDameBotMove(piece, moves) {
  return [...moves].sort((a, b) => scoreDameMove(piece, b) - scoreDameMove(piece, a))[0];
}

function scoreDameMove(piece, move) {
  let score = move.capture ? 20 : 0;
  score += piece.king ? 2 : move.row;
  if (move.row === 7) score += 8;
  return score;
}

function applyDameMove(piece, move) {
  piece.row = move.row;
  piece.col = move.col;
  if (move.capture) {
    delete dameState.pieces[move.capture.id];
  }
  if (piece.player === DAME_HUMAN && piece.row === 0) piece.king = true;
  if (piece.player === DAME_BOT && piece.row === 7) piece.king = true;
}

function getDameLegalMoves(piece, capturesOnly = false) {
  if (!piece) return [];
  const directions = getDameDirections(piece);
  const moves = [];

  directions.forEach(([rowStep, colStep]) => {
    const stepRow = piece.row + rowStep;
    const stepCol = piece.col + colStep;
    const jumpRow = piece.row + rowStep * 2;
    const jumpCol = piece.col + colStep * 2;
    const jumpedPiece = getDamePieceAt(stepRow, stepCol);

    if (
      isInsideDameBoard(jumpRow, jumpCol) &&
      jumpedPiece &&
      jumpedPiece.player !== piece.player &&
      !getDamePieceAt(jumpRow, jumpCol)
    ) {
      moves.push({ row: jumpRow, col: jumpCol, capture: jumpedPiece });
    }

    if (!capturesOnly && isInsideDameBoard(stepRow, stepCol) && !jumpedPiece) {
      moves.push({ row: stepRow, col: stepCol, capture: null });
    }
  });

  return moves;
}

function getDameDirections(piece) {
  if (piece.king) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  }
  return piece.player === DAME_HUMAN ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
}

function hasAnyDameCapture(player) {
  return Object.values(dameState.pieces)
    .filter(piece => piece.player === player)
    .some(piece => getDameLegalMoves(piece, true).some(move => move.capture));
}

function isDameLegalTarget(row, col) {
  if (!selectedDamePieceId) return false;
  const piece = dameState.pieces[selectedDamePieceId];
  return getDameLegalMoves(piece, hasAnyDameCapture(DAME_HUMAN)).some(move => move.row === row && move.col === col);
}

function checkDameWinner() {
  const humanPieces = Object.values(dameState.pieces).filter(piece => piece.player === DAME_HUMAN);
  const botPieces = Object.values(dameState.pieces).filter(piece => piece.player === DAME_BOT);
  if (!humanPieces.length) dameState.winner = DAME_BOT;
  if (!botPieces.length) dameState.winner = DAME_HUMAN;
  if (!dameState.winner) return false;

  dameState.botThinking = false;
  saveDameState();
  renderDameBoard();
  updateDameStatus(dameState.winner === DAME_HUMAN ? 'Du hast gewonnen!' : 'Der Computer hat gewonnen.');
  return true;
}

function getDamePieceAt(row, col) {
  return Object.values(dameState.pieces).find(piece => piece.row === row && piece.col === col) || null;
}

function isDarkDameSquare(row, col) {
  return (row + col) % 2 === 1;
}

function isInsideDameBoard(row, col) {
  return row >= 0 && row < DAME_SIZE && col >= 0 && col < DAME_SIZE && isDarkDameSquare(row, col);
}

function isDameBotTurn() {
  return dameState?.currentPlayer === DAME_BOT || dameState?.botThinking;
}

function updateDameCounts() {
  const humanCount = document.getElementById('dame-human-count');
  const botCount = document.getElementById('dame-bot-count');
  if (humanCount) humanCount.textContent = String(Object.values(dameState.pieces).filter(piece => piece.player === DAME_HUMAN).length);
  if (botCount) botCount.textContent = String(Object.values(dameState.pieces).filter(piece => piece.player === DAME_BOT).length);
}

function updateDameStatus(message) {
  const status = document.getElementById('dame-status');
  if (!status) return;
  status.textContent = message || (isDameBotTurn() ? 'Der Computer ist dran.' : 'Du bist dran.');
}

function getDameCellLabel(row, col, piece) {
  if (!isDarkDameSquare(row, col)) return 'Helles Feld';
  if (!piece) return `Freies Feld Reihe ${row + 1}, Spalte ${col + 1}`;
  return `${piece.player === DAME_HUMAN ? 'Rote' : 'Blaue'} Figur`;
}
