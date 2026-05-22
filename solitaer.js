const SOLITAER_SAVE_KEY = 'omasSolitaerSpiel';
const SOLITAER_DEFAULT_SHAPE = 'englisch';
const SOLITAER_SHAPES = [
  {
    id: 'englisch',
    label: 'Englisch',
    size: 7,
    center: '3,3',
    isValid: (row, col) => row >= 2 && row <= 4 || col >= 2 && col <= 4
  },
  {
    id: 'europaeisch',
    label: 'Europäisch',
    size: 7,
    center: '3,3',
    rowCounts: [3, 5, 7, 7, 7, 5, 3]
  },
  {
    id: 'diamant',
    label: 'Diamant',
    size: 7,
    center: '3,3',
    rowCounts: [1, 3, 5, 7, 5, 3, 1]
  },
  {
    id: 'klein',
    label: 'Kleines Kreuz',
    size: 5,
    center: '2,2',
    isValid: (row, col) => row >= 1 && row <= 3 || col >= 1 && col <= 3
  }
];
const SOLITAER_DIRECTIONS = [
  { dr: -2, dc: 0 },
  { dr: 2, dc: 0 },
  { dr: 0, dc: -2 },
  { dr: 0, dc: 2 }
];

let solitaerState = null;

function initSolitaerPage() {
  const newGameButton = document.getElementById('solitaer-new-game-button');
  const undoButton = document.getElementById('solitaer-undo-button');
  if (!newGameButton || !undoButton) return;

  newGameButton.addEventListener('click', startNewSolitaerGame);
  undoButton.addEventListener('click', undoSolitaerMove);
  setupSolitaerShapeButtons();

  window.cleanupOmasDynamicPage = function () {};

  solitaerState = loadSolitaerState() || createNewSolitaerState();
  saveSolitaerState();
  renderSolitaer();
  updateSolitaerStatus();
}

window.initSolitaerPage = initSolitaerPage;
document.addEventListener('DOMContentLoaded', initSolitaerPage);

function createNewSolitaerState(shapeId = SOLITAER_DEFAULT_SHAPE) {
  const shape = getSolitaerShape(shapeId);
  const board = {};
  for (let row = 0; row < shape.size; row++) {
    for (let col = 0; col < shape.size; col++) {
      if (isSolitaerValidCell(row, col, shape)) {
        board[getSolitaerKey(row, col)] = getSolitaerKey(row, col) === shape.center ? 0 : 1;
      }
    }
  }

  return {
    shapeId: shape.id,
    board,
    selected: null,
    moves: 0,
    history: [],
    finished: false
  };
}

function loadSolitaerState() {
  try {
    const state = JSON.parse(localStorage.getItem(SOLITAER_SAVE_KEY));
    if (!state || !state.board) return null;
    state.shapeId = getSolitaerShape(state.shapeId).id;
    state.history = Array.isArray(state.history) ? state.history : [];
    state.selected = null;
    state.finished = Boolean(state.finished);
    return state;
  } catch (error) {
    return null;
  }
}

function saveSolitaerState() {
  localStorage.setItem(SOLITAER_SAVE_KEY, JSON.stringify(solitaerState));
}

function startNewSolitaerGame(shapeId = getCurrentSolitaerShape().id) {
  solitaerState = createNewSolitaerState(shapeId);
  saveSolitaerState();
  renderSolitaer();
  updateSolitaerStatus('Neues Spiel gestartet.');
}

function setupSolitaerShapeButtons() {
  const container = document.getElementById('solitaer-shape-buttons');
  if (!container) return;
  container.innerHTML = '';

  SOLITAER_SHAPES.forEach(shape => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.shape = shape.id;
    button.textContent = shape.label;
    button.addEventListener('click', () => {
      startNewSolitaerGame(shape.id);
      updateSolitaerStatus(`${shape.label} Brett gestartet.`);
    });
    container.appendChild(button);
  });
}

function undoSolitaerMove() {
  const previous = solitaerState.history.pop();
  if (!previous) {
    updateSolitaerStatus('Es gibt noch keinen Zug zum Zurücknehmen.');
    return;
  }

  solitaerState.board = previous.board;
  solitaerState.moves = previous.moves;
  solitaerState.selected = null;
  solitaerState.finished = false;
  saveSolitaerState();
  renderSolitaer();
  updateSolitaerStatus('Der letzte Zug wurde zurückgenommen.');
}

function renderSolitaer() {
  renderSolitaerBoard();
  updateSolitaerStats();
  updateSolitaerHint();
  updateSolitaerShapeButtons();
}

function renderSolitaerBoard() {
  const boardElement = document.getElementById('solitaer-board');
  if (!boardElement) return;
  const shape = getCurrentSolitaerShape();
  boardElement.innerHTML = '';
  boardElement.style.setProperty('--solitaer-size', shape.size);

  const legalTargets = solitaerState.selected ? getSolitaerMovesFrom(solitaerState.selected).map(move => move.to) : [];

  for (let row = 0; row < shape.size; row++) {
    for (let col = 0; col < shape.size; col++) {
      if (!isSolitaerValidCell(row, col, shape)) {
        const spacer = document.createElement('div');
        spacer.className = 'solitaer-space';
        boardElement.appendChild(spacer);
        continue;
      }

      const key = getSolitaerKey(row, col);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'solitaer-hole';
      cell.classList.toggle('solitaer-hole-center', key === shape.center);
      cell.classList.toggle('solitaer-hole-selected', solitaerState.selected === key);
      cell.classList.toggle('solitaer-hole-target', legalTargets.includes(key));
      cell.setAttribute('aria-label', getSolitaerCellLabel(key));
      cell.addEventListener('click', () => handleSolitaerCellClick(key));

      if (solitaerState.board[key] === 1) {
        const marble = document.createElement('span');
        marble.className = 'solitaer-marble';
        marble.textContent = '●';
        cell.appendChild(marble);
      }

      boardElement.appendChild(cell);
    }
  }
}

function handleSolitaerCellClick(key) {
  if (solitaerState.finished) return;

  if (solitaerState.board[key] === 1) {
    solitaerState.selected = key;
    saveSolitaerState();
    renderSolitaer();
    const moves = getSolitaerMovesFrom(key);
    updateSolitaerStatus(moves.length ? 'Jetzt ein gelbes freies Loch anklicken.' : 'Diese Murmel kann gerade nicht springen.');
    return;
  }

  if (!solitaerState.selected) {
    updateSolitaerStatus('Erst eine Murmel anklicken.');
    return;
  }

  const move = getSolitaerMovesFrom(solitaerState.selected).find(candidate => candidate.to === key);
  if (!move) {
    updateSolitaerStatus('Dorthin kann diese Murmel nicht springen.');
    return;
  }

  applySolitaerMove(move);
}

function applySolitaerMove(move) {
  solitaerState.history.push({
    board: { ...solitaerState.board },
    moves: solitaerState.moves
  });

  solitaerState.board[move.from] = 0;
  solitaerState.board[move.over] = 0;
  solitaerState.board[move.to] = 1;
  solitaerState.moves++;
  solitaerState.selected = null;
  solitaerState.finished = !hasAnySolitaerMove();

  saveSolitaerState();
  renderSolitaer();
  updateSolitaerStatus(getSolitaerEndText() || 'Gut gesprungen.');
}

function getSolitaerMovesFrom(fromKey) {
  const [row, col] = parseSolitaerKey(fromKey);
  if (solitaerState.board[fromKey] !== 1) return [];

  return SOLITAER_DIRECTIONS
    .map(direction => {
      const midRow = row + direction.dr / 2;
      const midCol = col + direction.dc / 2;
      const toRow = row + direction.dr;
      const toCol = col + direction.dc;
      return {
        from: fromKey,
        over: getSolitaerKey(midRow, midCol),
        to: getSolitaerKey(toRow, toCol)
      };
    })
    .filter(move => (
      isSolitaerValidKey(move.over)
      && isSolitaerValidKey(move.to)
      && solitaerState.board[move.over] === 1
      && solitaerState.board[move.to] === 0
    ));
}

function hasAnySolitaerMove() {
  return Object.keys(solitaerState.board).some(key => getSolitaerMovesFrom(key).length > 0);
}

function getSolitaerEndText() {
  if (!solitaerState.finished) return '';

  const marbleCount = getSolitaerMarbleCount();
  if (marbleCount === 1 && solitaerState.board[getCurrentSolitaerShape().center] === 1) {
    return 'Gewonnen! Eine Murmel ist genau in der Mitte geblieben.';
  }

  if (marbleCount === 1) {
    return 'Fast perfekt: Nur eine Murmel ist übrig.';
  }

  return 'Kein Sprung mehr möglich. Du kannst neu starten oder einen Zug zurücknehmen.';
}

function updateSolitaerStats() {
  const moveCount = document.getElementById('solitaer-move-count');
  const marbleCount = document.getElementById('solitaer-marble-count');
  const undoButton = document.getElementById('solitaer-undo-button');
  if (moveCount) moveCount.textContent = String(solitaerState.moves);
  if (marbleCount) marbleCount.textContent = String(getSolitaerMarbleCount());
  if (undoButton) undoButton.disabled = solitaerState.history.length === 0;
}

function updateSolitaerHint() {
  const hint = document.getElementById('solitaer-step-hint');
  if (!hint) return;
  if (solitaerState.finished) {
    hint.textContent = getSolitaerEndText();
  } else if (solitaerState.selected) {
    hint.textContent = 'Jetzt ein gelbes freies Loch anklicken.';
  } else {
    hint.textContent = 'Erst eine Murmel anklicken. Dann springt sie über eine andere Murmel in ein freies Loch.';
  }
}

function updateSolitaerStatus(message) {
  const status = document.getElementById('solitaer-status');
  if (!status) return;
  status.textContent = message || 'Ziel: Am Ende bleibt nur eine Murmel übrig, am besten in der Mitte.';
}

function getSolitaerMarbleCount() {
  return Object.values(solitaerState.board).filter(value => value === 1).length;
}

function getSolitaerCellLabel(key) {
  if (solitaerState.board[key] === 1) return 'Murmel';
  if (key === getCurrentSolitaerShape().center) return 'Freie Mitte';
  return 'Freies Loch';
}

function isSolitaerValidCell(row, col, shape = getCurrentSolitaerShape()) {
  if (row < 0 || row >= shape.size || col < 0 || col >= shape.size) return false;
  if (shape.rowCounts) {
    const count = shape.rowCounts[row] || 0;
    const start = Math.floor((shape.size - count) / 2);
    return col >= start && col < start + count;
  }
  return shape.isValid(row, col);
}

function isSolitaerValidKey(key) {
  const [row, col] = parseSolitaerKey(key);
  return isSolitaerValidCell(row, col);
}

function getCurrentSolitaerShape() {
  return getSolitaerShape(solitaerState?.shapeId);
}

function getSolitaerShape(shapeId) {
  return SOLITAER_SHAPES.find(shape => shape.id === shapeId) || SOLITAER_SHAPES[0];
}

function updateSolitaerShapeButtons() {
  const container = document.getElementById('solitaer-shape-buttons');
  if (!container) return;
  const currentShape = getCurrentSolitaerShape();
  container.querySelectorAll('button').forEach(button => {
    button.classList.toggle('active', button.dataset.shape === currentShape.id);
  });
}

function getSolitaerKey(row, col) {
  return `${row},${col}`;
}

function parseSolitaerKey(key) {
  return key.split(',').map(Number);
}
