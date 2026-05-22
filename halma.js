const HALMA_SAVE_KEY = 'omasHalmaSpiel';
const HALMA_RECORDS_KEY = 'omasHalmaRekorde';
const HALMA_HUMAN_PLAYER = 'rot';
const HALMA_COMPUTER_PLAYER = 'blau';
const HALMA_MODE_SOLO = 'solo';
const HALMA_MODE_BOT = 'bot';
const HALMA_MIN_SOLO_COLOR_COUNT = 1;
const HALMA_MAX_SOLO_COLOR_COUNT = 6;
const HALMA_PLAYER_LABELS = {
  rot: 'Rot',
  blau: 'Blau',
  gelb: 'Gelb',
  gruen: 'Grün',
  lila: 'Lila',
  orange: 'Orange'
};
const HALMA_DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const HALMA_BOARD_SHAPES = {
  klassisch: {
    id: 'klassisch',
    label: 'Klassisch',
    size: 10,
    start: {
      rot: createTriangleCamp(10, 'topLeft', 3),
      blau: createTriangleCamp(10, 'bottomRight', 3)
    },
    goal: {
      rot: createTriangleCamp(10, 'bottomRight', 3),
      blau: createTriangleCamp(10, 'topLeft', 3)
    },
    camps: [
      { className: 'halma-camp-blau', cells: createTriangleCamp(10, 'topLeft', 3) },
      { className: 'halma-camp-rot', cells: createTriangleCamp(10, 'bottomRight', 3) }
    ]
  },
  plus: {
    id: 'plus',
    label: 'Plus',
    size: 9,
    start: {
      rot: createRectangleCamp(0, 3, 2, 5),
      blau: createRectangleCamp(6, 3, 8, 5)
    },
    goal: {
      rot: createRectangleCamp(6, 3, 8, 5),
      blau: createRectangleCamp(0, 3, 2, 5)
    },
    camps: [
      { className: 'halma-camp-blau', cells: createRectangleCamp(0, 3, 2, 5) },
      { className: 'halma-camp-rot', cells: createRectangleCamp(6, 3, 8, 5) }
    ],
    isCellValid(row, col) {
      return (row >= 3 && row <= 5) || (col >= 3 && col <= 5);
    }
  },
  stern: {
    id: 'stern',
    label: 'Stern',
    size: 13,
    start: {
      rot: createStarTopCamp(),
      blau: createStarBottomCamp(),
      gelb: createStarRightLowerCamp(),
      gruen: createStarLeftLowerCamp(),
      lila: createStarRightUpperCamp(),
      orange: createStarLeftUpperCamp()
    },
    goal: {
      rot: createStarBottomCamp(),
      blau: createStarTopCamp(),
      gelb: createStarLeftUpperCamp(),
      gruen: createStarRightUpperCamp(),
      lila: createStarLeftLowerCamp(),
      orange: createStarRightLowerCamp()
    },
    camps: [
      { className: 'halma-camp-blau', cells: createStarTopCamp() },
      { className: 'halma-camp-rot', cells: createStarBottomCamp() },
      { className: 'halma-camp-gelb', cells: createStarLeftUpperCamp() },
      { className: 'halma-camp-gruen', cells: createStarRightUpperCamp() },
      { className: 'halma-camp-lila', cells: createStarLeftLowerCamp() },
      { className: 'halma-camp-orange', cells: createStarRightLowerCamp() }
    ],
    isCellValid(row, col) {
      return getStarRowRange(row) !== null &&
        col >= getStarRowRange(row).start &&
        col <= getStarRowRange(row).end;
    }
  }
};

function createCell(row, col) {
  return { row, col };
}

function createRectangleCamp(startRow, startCol, endRow, endCol) {
  const cells = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push(createCell(row, col));
    }
  }
  return cells;
}

function createTriangleCamp(size, corner, depth) {
  const cells = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (corner === 'topLeft' && row + col <= depth) {
        cells.push(createCell(row, col));
      }

      if (corner === 'bottomRight' && row + col >= (size - 1) * 2 - depth) {
        cells.push(createCell(row, col));
      }

      if (corner === 'bottomLeft' && row - col >= size - 1 - depth) {
        cells.push(createCell(row, col));
      }

      if (corner === 'topRight' && col - row >= size - 1 - depth) {
        cells.push(createCell(row, col));
      }
    }
  }
  return cells;
}

function getStarRowRange(row) {
  return [
    { start: 6, end: 6 },
    { start: 5, end: 7 },
    { start: 4, end: 8 },
    { start: 0, end: 12 },
    { start: 1, end: 11 },
    { start: 2, end: 10 },
    { start: 3, end: 9 },
    { start: 2, end: 10 },
    { start: 1, end: 11 },
    { start: 0, end: 12 },
    { start: 4, end: 8 },
    { start: 5, end: 7 },
    { start: 6, end: 6 }
  ][row] || null;
}

function createStarTopCamp() {
  return [
    createCell(0, 6),
    createCell(1, 5), createCell(1, 6), createCell(1, 7),
    createCell(2, 4), createCell(2, 5), createCell(2, 6), createCell(2, 7), createCell(2, 8),
    createCell(3, 6)
  ];
}

function createStarBottomCamp() {
  return [
    createCell(12, 6),
    createCell(11, 5), createCell(11, 6), createCell(11, 7),
    createCell(10, 4), createCell(10, 5), createCell(10, 6), createCell(10, 7), createCell(10, 8),
    createCell(9, 6)
  ];
}

function createStarLeftUpperCamp() {
  return [
    createCell(3, 0), createCell(3, 1), createCell(3, 2), createCell(3, 3),
    createCell(4, 1), createCell(4, 2), createCell(4, 3),
    createCell(5, 2), createCell(5, 3),
    createCell(6, 3)
  ];
}

function createStarRightUpperCamp() {
  return [
    createCell(3, 9), createCell(3, 10), createCell(3, 11), createCell(3, 12),
    createCell(4, 9), createCell(4, 10), createCell(4, 11),
    createCell(5, 9), createCell(5, 10),
    createCell(6, 9)
  ];
}

function createStarLeftLowerCamp() {
  return [
    createCell(6, 3),
    createCell(7, 2), createCell(7, 3),
    createCell(8, 1), createCell(8, 2), createCell(8, 3),
    createCell(9, 0), createCell(9, 1), createCell(9, 2), createCell(9, 3)
  ];
}

function createStarRightLowerCamp() {
  return [
    createCell(6, 9),
    createCell(7, 9), createCell(7, 10),
    createCell(8, 9), createCell(8, 10), createCell(8, 11),
    createCell(9, 9), createCell(9, 10), createCell(9, 11), createCell(9, 12)
  ];
}

let halmaState = null;
let halmaCarriedPiece = null;
let halmaFloatingPiece = null;
let halmaComputerTimer = null;

function initHalmaPage() {
  const board = document.getElementById('halma-board');
  const newGameButton = document.getElementById('halma-new-game-button');
  const endTurnButton = document.getElementById('halma-end-turn-button');

  if (!board || !newGameButton || !endTurnButton) {
    return;
  }

  newGameButton.addEventListener('click', startNewHalmaGame);
  endTurnButton.addEventListener('click', finishHalmaJumpTurn);

  document.removeEventListener('pointermove', moveHalmaFloatingPiece);
  document.addEventListener('pointermove', moveHalmaFloatingPiece);

  window.cleanupOmasDynamicPage = function () {
    stopCarryingHalmaPiece();
    window.clearTimeout(halmaComputerTimer);
    document.removeEventListener('pointermove', moveHalmaFloatingPiece);
  };

  halmaState = loadHalmaState() || createNewHalmaState(HALMA_MODE_SOLO, 'klassisch');
  saveHalmaState();
  renderHalmaModeButtons();
  renderHalmaColorButtons();
  renderHalmaShapeButtons();
  renderHalmaBoard();
  updateHalmaStatus();
  updateHalmaStats();

  if (isBotThinkingTurn()) {
    scheduleComputerHalmaMove();
  }
}

window.initHalmaPage = initHalmaPage;
document.addEventListener('DOMContentLoaded', initHalmaPage);

function createNewHalmaState(mode, shapeId, soloColors = 1) {
  const validMode = mode === HALMA_MODE_BOT ? HALMA_MODE_BOT : HALMA_MODE_SOLO;
  const validShapeId = HALMA_BOARD_SHAPES[shapeId] ? shapeId : 'klassisch';
  const validSoloColors = getValidSoloColors(validShapeId, validMode, soloColors);
  const shape = HALMA_BOARD_SHAPES[validShapeId];
  const pieces = {};

  getActiveHumanPlayers(shape, validMode, validSoloColors).forEach(player => {
    getStartCamp(validShapeId, player).forEach((cell, index) => {
      pieces[`${player}-${index}`] = {
        id: `${player}-${index}`,
        player,
        row: cell.row,
        col: cell.col
      };
    });
  });

  if (validMode === HALMA_MODE_BOT) {
    getStartCamp(validShapeId, HALMA_COMPUTER_PLAYER).forEach((cell, index) => {
      pieces[`blau-${index}`] = {
        id: `blau-${index}`,
        player: HALMA_COMPUTER_PLAYER,
        row: cell.row,
        col: cell.col
      };
    });
  }

  return {
    mode: validMode,
    soloColors: validSoloColors,
    boardShape: validShapeId,
    pieces,
    currentPlayer: HALMA_HUMAN_PLAYER,
    moves: 0,
    turns: 0,
    lastHumanPieceId: null,
    activeJumpPieceId: null,
    winner: null,
    computerThinking: false
  };
}

function getActiveHumanPlayers(shape, mode, soloColors) {
  if (mode === HALMA_MODE_BOT) {
    return [HALMA_HUMAN_PLAYER];
  }

  return getShapeSoloPlayers(shape).slice(0, soloColors);
}

function getShapeSoloPlayers(shape) {
  const preferredOrder = ['rot', 'blau', 'gelb', 'gruen', 'lila', 'orange'];
  return preferredOrder.filter(player => shape.start[player] && shape.goal[player]);
}

function canUseMultiColorSolo(shapeId) {
  const shape = HALMA_BOARD_SHAPES[shapeId] || HALMA_BOARD_SHAPES.klassisch;
  return getShapeSoloPlayers(shape).length > 2;
}

function getValidSoloColors(shapeId, mode, soloColors) {
  if (mode !== HALMA_MODE_SOLO || !canUseMultiColorSolo(shapeId)) {
    return 1;
  }

  const colorCount = Number(soloColors);
  if (!Number.isFinite(colorCount)) {
    return 1;
  }

  const availableCount = getShapeSoloPlayers(HALMA_BOARD_SHAPES[shapeId]).length;
  return Math.max(HALMA_MIN_SOLO_COLOR_COUNT, Math.min(availableCount, Math.floor(colorCount)));
}

function loadHalmaState() {
  try {
    const saved = JSON.parse(localStorage.getItem(HALMA_SAVE_KEY));
    if (!saved || !saved.pieces || !saved.currentPlayer) {
      return null;
    }

    if (!HALMA_BOARD_SHAPES[saved.boardShape]) {
      saved.boardShape = 'klassisch';
    }

    saved.mode = saved.mode === HALMA_MODE_BOT ? HALMA_MODE_BOT : HALMA_MODE_SOLO;
    if (saved.soloColors === 'all') {
      saved.soloColors = HALMA_MAX_SOLO_COLOR_COUNT;
    }
    if (saved.soloColors === 'one') {
      saved.soloColors = 1;
    }
    saved.soloColors = getValidSoloColors(saved.boardShape, saved.mode, saved.soloColors);
    saved.turns = Number.isFinite(saved.turns) ? saved.turns : saved.moves || 0;
    saved.lastHumanPieceId = saved.lastHumanPieceId || null;

    if (saved.mode === HALMA_MODE_SOLO) {
      const allowedPlayers = getActiveHumanPlayers(HALMA_BOARD_SHAPES[saved.boardShape], saved.mode, saved.soloColors);
      Object.keys(saved.pieces).forEach(pieceId => {
        if (!allowedPlayers.includes(saved.pieces[pieceId].player)) {
          delete saved.pieces[pieceId];
        }
      });
      saved.currentPlayer = HALMA_HUMAN_PLAYER;
    }

    if (
      saved.mode === HALMA_MODE_BOT &&
      !Object.values(saved.pieces).some(piece => piece.player === HALMA_COMPUTER_PLAYER)
    ) {
      return createNewHalmaState(HALMA_MODE_BOT, saved.boardShape);
    }

    saved.computerThinking = false;
    return saved;
  } catch (error) {
    return null;
  }
}

function saveHalmaState() {
  if (halmaState) {
    localStorage.setItem(HALMA_SAVE_KEY, JSON.stringify(halmaState));
  }
}

function startNewHalmaGame() {
  stopCarryingHalmaPiece();
  window.clearTimeout(halmaComputerTimer);
  halmaState = createNewHalmaState(
    halmaState?.mode || HALMA_MODE_SOLO,
    halmaState?.boardShape || 'klassisch',
    halmaState?.soloColors || 1
  );
  saveHalmaState();
  renderHalmaModeButtons();
  renderHalmaColorButtons();
  renderHalmaShapeButtons();
  renderHalmaBoard();
  updateHalmaStats();
  updateHalmaStatus(halmaState.mode === HALMA_MODE_SOLO
    ? 'Neues Solo-Spiel gestartet.'
    : 'Neues Spiel gegen den Computer gestartet. Du beginnst mit Rot.');
}

function renderHalmaModeButtons() {
  const modeButtons = document.getElementById('halma-mode-buttons');
  if (!modeButtons || !halmaState) {
    return;
  }

  const modes = [
    { id: HALMA_MODE_SOLO, label: 'Allein' },
    { id: HALMA_MODE_BOT, label: 'Gegen Computer' }
  ];

  modeButtons.innerHTML = '';
  modes.forEach(mode => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.halmaMode = mode.id;
    button.textContent = mode.label;
    button.classList.toggle('active', halmaState.mode === mode.id);
    button.addEventListener('click', () => {
      if (halmaState.mode === mode.id) {
        return;
      }

      const previousMode = halmaState.mode;
      stopCarryingHalmaPiece();
      window.clearTimeout(halmaComputerTimer);
      halmaState = createNewHalmaState(
        mode.id,
        halmaState.boardShape,
        previousMode === HALMA_MODE_SOLO ? halmaState.soloColors : 1
      );
      saveHalmaState();
      renderHalmaModeButtons();
      renderHalmaColorButtons();
      renderHalmaShapeButtons();
      renderHalmaBoard();
      updateHalmaStats();
      updateHalmaStatus(`${mode.label} ausgewählt. Neues Spiel gestartet.`);
    });
    modeButtons.appendChild(button);
  });
}

function renderHalmaColorButtons() {
  const colorButtons = document.getElementById('halma-color-buttons');
  const colorChoice = document.getElementById('halma-color-choice');
  if (!colorButtons || !colorChoice || !halmaState) {
    return;
  }

  const canUseAll = canUseMultiColorSolo(halmaState.boardShape);
  colorChoice.hidden = halmaState.mode !== HALMA_MODE_SOLO || !canUseAll;
  colorButtons.innerHTML = '';

  const availableCount = getShapeSoloPlayers(getHalmaShape()).length;
  for (let colorCount = 1; colorCount <= availableCount; colorCount++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.halmaColors = String(colorCount);
    button.textContent = colorCount === 1 ? '1 Farbe' : `${colorCount} Farben`;
    button.classList.toggle('active', halmaState.soloColors === colorCount);
    button.addEventListener('click', () => {
      if (halmaState.soloColors === colorCount) {
        return;
      }

      stopCarryingHalmaPiece();
      window.clearTimeout(halmaComputerTimer);
      halmaState = createNewHalmaState(halmaState.mode, halmaState.boardShape, colorCount);
      saveHalmaState();
      renderHalmaModeButtons();
      renderHalmaColorButtons();
      renderHalmaShapeButtons();
      renderHalmaBoard();
      updateHalmaStats();
      updateHalmaStatus(`${button.textContent} ausgewählt. Neues Spiel gestartet.`);
    });
    colorButtons.appendChild(button);
  }
}

function renderHalmaShapeButtons() {
  const shapeButtons = document.getElementById('halma-shape-buttons');
  if (!shapeButtons || !halmaState) {
    return;
  }

  shapeButtons.innerHTML = '';
  Object.values(HALMA_BOARD_SHAPES).forEach(shape => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.boardShape = shape.id;
    button.textContent = shape.label;
    button.classList.toggle('active', halmaState.boardShape === shape.id);
    button.addEventListener('click', () => {
      if (halmaState.boardShape === shape.id) {
        return;
      }

      stopCarryingHalmaPiece();
      window.clearTimeout(halmaComputerTimer);
      halmaState = createNewHalmaState(halmaState.mode, shape.id, halmaState.soloColors);
      saveHalmaState();
      renderHalmaModeButtons();
      renderHalmaColorButtons();
      renderHalmaShapeButtons();
      renderHalmaBoard();
      updateHalmaStats();
      updateHalmaStatus(`${shape.label} ausgewählt. Neues Spiel gestartet.`);
    });
    shapeButtons.appendChild(button);
  });
}

function renderHalmaBoard() {
  const board = document.getElementById('halma-board');
  if (!board || !halmaState) {
    return;
  }

  const shape = getHalmaShape();
  board.style.setProperty('--halma-board-size', shape.size);
  board.className = 'halma-board';
  board.classList.toggle('halma-board-lines', shape.boardStyle === 'lines');
  board.innerHTML = '';

  if (shape.boardStyle === 'lines') {
    renderHalmaBoardLines(board, shape);
  }

  for (let row = 0; row < shape.size; row++) {
    for (let col = 0; col < shape.size; col++) {
      if (!isCellValidForShape(shape, row, col)) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'halma-cell-empty';
        board.appendChild(emptyCell);
        continue;
      }

      const cell = document.createElement('button');
      const piece = getPieceAt(row, col);

      cell.type = 'button';
      cell.className = 'halma-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.disabled = isBotThinkingTurn();
      cell.setAttribute('aria-label', getHalmaCellLabel(row, col, piece));

      if ((row + col) % 2 === 1) {
        cell.classList.add('halma-cell-shaded');
      }

      getHalmaCampClasses(row, col).forEach(className => cell.classList.add(className));

      if (isLegalTarget(row, col)) {
        cell.classList.add('halma-legal-target');
      }

      if (piece) {
        const pieceElement = document.createElement('span');
        pieceElement.className = `halma-piece halma-piece-${piece.player}`;
        pieceElement.textContent = getHalmaPieceLetter(piece.player);

        if (halmaCarriedPiece && halmaCarriedPiece.id === piece.id) {
          pieceElement.classList.add('halma-piece-carried');
        }

        cell.appendChild(pieceElement);
      }

      cell.addEventListener('click', event => handleHalmaCellClick(row, col, event));
      board.appendChild(cell);
    }
  }

  updateHalmaEndTurnButton();
}

function renderHalmaBoardLines(board, shape) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'halma-board-lines-svg');
  svg.setAttribute('viewBox', `0 0 ${shape.size} ${shape.size}`);
  svg.setAttribute('aria-hidden', 'true');

  const directions = shape.latticeDirections || [[0, 1], [1, 0], [1, 1], [1, -1]];

  getAllBoardCells(shape).forEach(cell => {
    if (!isCellValidForShape(shape, cell.row, cell.col)) {
      return;
    }

    directions.forEach(([rowStep, colStep]) => {
      const nextRow = cell.row + rowStep;
      const nextCol = cell.col + colStep;
      if (!isCellValidForShape(shape, nextRow, nextCol)) {
        return;
      }

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cell.col + 0.5));
      line.setAttribute('y1', String(cell.row + 0.5));
      line.setAttribute('x2', String(nextCol + 0.5));
      line.setAttribute('y2', String(nextRow + 0.5));
      svg.appendChild(line);
    });
  });

  board.appendChild(svg);
}

function handleHalmaCellClick(row, col, event) {
  const piece = getPieceAt(row, col);

  if (halmaState.winner) {
    updateHalmaStatus('Das Spiel ist schon fertig. Für eine neue Runde bitte "Neues Spiel" drücken.');
    return;
  }

  if (isBotThinkingTurn()) {
    updateHalmaStatus('Der Computer ist dran. Einen kleinen Moment bitte.');
    return;
  }

  if (!halmaCarriedPiece) {
    if (!piece || !isHumanControlledPlayer(piece.player)) {
      updateHalmaStatus('Bitte eine eigene Figur wählen.');
      return;
    }

    if (halmaState.activeJumpPieceId && piece.id !== halmaState.activeJumpPieceId) {
      updateHalmaStatus('Nach einem Sprung darf nur diese Figur weiterspringen.');
      return;
    }

    pickUpHalmaPiece(piece, event);
    return;
  }

  if (piece && piece.id === halmaCarriedPiece.id) {
    stopCarryingHalmaPiece();
    renderHalmaBoard();
    updateHalmaStatus('Figur wieder abgesetzt. Wähle eine eigene Figur.');
    return;
  }

  tryDropHalmaPiece(row, col);
}

function pickUpHalmaPiece(piece, event) {
  halmaCarriedPiece = { ...piece };
  halmaFloatingPiece = document.createElement('div');
  halmaFloatingPiece.className = `halma-floating-piece halma-piece halma-piece-${piece.player}`;
  halmaFloatingPiece.textContent = getHalmaPieceLetter(piece.player);
  document.body.appendChild(halmaFloatingPiece);

  moveHalmaFloatingPiece(event);
  renderHalmaBoard();
  updateHalmaStatus('Figur aufgenommen. Klicke auf ein freies Feld.');
}

function moveHalmaFloatingPiece(event) {
  if (!halmaFloatingPiece || !halmaCarriedPiece) {
    return;
  }

  halmaFloatingPiece.style.left = `${event.clientX}px`;
  halmaFloatingPiece.style.top = `${event.clientY}px`;
}

function tryDropHalmaPiece(row, col) {
  if (!halmaCarriedPiece || !isLegalTarget(row, col)) {
    stopCarryingHalmaPiece();
    renderHalmaBoard();
    updateHalmaStatus('Dieser Zug geht nicht. Die Figur bleibt stehen.');
    return;
  }

  const piece = halmaState.pieces[halmaCarriedPiece.id];
  const move = getHalmaMoveType(piece, row, col);

  piece.row = row;
  piece.col = col;
  halmaState.moves++;
  countHalmaTurnForPiece(piece);
  stopCarryingHalmaPiece();

  if (hasPlayerWon(piece.player)) {
    endHalmaGame(piece.player);
    return;
  }

  if (
    halmaState.mode === HALMA_MODE_BOT &&
    move === 'jump' &&
    getLegalMoves(piece).some(nextMove => nextMove.type === 'jump')
  ) {
    halmaState.activeJumpPieceId = piece.id;
    saveHalmaState();
    renderHalmaBoard();
    updateHalmaStats();
    updateHalmaStatus('Sprung geschafft. Du darfst mit dieser Figur noch einmal springen oder den Zug beenden.');
    return;
  }

  finishHalmaJumpTurn();
}

function finishHalmaJumpTurn() {
  if (!halmaState || halmaState.winner) {
    return;
  }

  stopCarryingHalmaPiece();
  halmaState.activeJumpPieceId = null;

  if (halmaState.mode === HALMA_MODE_BOT) {
    halmaState.currentPlayer = HALMA_COMPUTER_PLAYER;
    halmaState.computerThinking = true;
    saveHalmaState();
    renderHalmaBoard();
    updateHalmaStats();
    updateHalmaStatus('Der Computer denkt kurz.');
    scheduleComputerHalmaMove();
    return;
  }

  halmaState.currentPlayer = HALMA_HUMAN_PLAYER;
  saveHalmaState();
  renderHalmaBoard();
  updateHalmaStats();
  updateHalmaStatus('Du bist wieder dran.');
}

function countHalmaTurnForPiece(piece) {
  if (!isHumanControlledPlayer(piece.player)) {
    return;
  }

  if (halmaState.mode === HALMA_MODE_SOLO) {
    if (halmaState.lastHumanPieceId !== piece.id) {
      halmaState.turns++;
      halmaState.lastHumanPieceId = piece.id;
    }
    return;
  }

  halmaState.turns++;
  halmaState.lastHumanPieceId = piece.id;
}

function scheduleComputerHalmaMove() {
  window.clearTimeout(halmaComputerTimer);
  halmaComputerTimer = window.setTimeout(playComputerHalmaTurn, 650);
}

async function playComputerHalmaTurn() {
  if (!halmaState || halmaState.winner || !isBotThinkingTurn()) {
    return;
  }

  let move = chooseComputerHalmaMove();
  const visitedJumpCells = new Set();
  if (!move) {
    halmaState.currentPlayer = HALMA_HUMAN_PLAYER;
    halmaState.computerThinking = false;
    saveHalmaState();
    renderHalmaBoard();
    updateHalmaStats();
    updateHalmaStatus('Der Computer kann nicht ziehen. Du bist wieder dran.');
    return;
  }

  while (move) {
    const piece = halmaState.pieces[move.pieceId];
    if (move.type === 'jump') {
      visitedJumpCells.add(`${piece.row}-${piece.col}`);
    }

    await animateHalmaBotMove(piece, move);
    piece.row = move.row;
    piece.col = move.col;
    saveHalmaState();
    renderHalmaBoard();
    await waitHalma(400);

    if (hasPlayerWon(piece.player)) {
      endHalmaGame(piece.player);
      return;
    }

    if (move.type !== 'jump') {
      break;
    }

    visitedJumpCells.add(`${piece.row}-${piece.col}`);
    const nextJump = chooseBestComputerMoveForPiece(piece, true, visitedJumpCells);
    if (!nextJump) {
      break;
    }

    move = nextJump;
  }

  halmaState.currentPlayer = HALMA_HUMAN_PLAYER;
  halmaState.activeJumpPieceId = null;
  halmaState.computerThinking = false;
  saveHalmaState();
  renderHalmaBoard();
  updateHalmaStats();
  updateHalmaStatus('Der Computer ist fertig. Du bist wieder dran.');
}

function animateHalmaBotMove(piece, move) {
  const board = document.getElementById('halma-board');
  if (!board) {
    return waitHalma(1500);
  }

  const fromCell = board.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
  const toCell = board.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
  if (!fromCell || !toCell) {
    return waitHalma(1500);
  }

  const fromRect = fromCell.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();
  const sourcePiece = fromCell.querySelector('.halma-piece');
  const floatingPiece = document.createElement('div');

  floatingPiece.className = `halma-floating-piece halma-bot-floating-piece halma-piece halma-piece-${piece.player}`;
  floatingPiece.textContent = getHalmaPieceLetter(piece.player);
  floatingPiece.style.left = `${fromRect.left + fromRect.width / 2}px`;
  floatingPiece.style.top = `${fromRect.top + fromRect.height / 2}px`;
  document.body.appendChild(floatingPiece);

  if (sourcePiece) {
    sourcePiece.classList.add('halma-piece-picked-up');
  }

  return new Promise(resolve => {
    window.setTimeout(() => {
      floatingPiece.classList.add('halma-floating-piece-lifted');

      window.setTimeout(() => {
        floatingPiece.style.left = `${toRect.left + toRect.width / 2}px`;
        floatingPiece.style.top = `${toRect.top + toRect.height / 2}px`;

        window.setTimeout(() => {
          floatingPiece.classList.remove('halma-floating-piece-lifted');

          window.setTimeout(() => {
            floatingPiece.remove();
            if (sourcePiece) {
              sourcePiece.classList.remove('halma-piece-picked-up');
            }
            resolve();
          }, 350);
        }, 1450);
      }, 300);
    }, 80);
  });
}

function waitHalma(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

function chooseComputerHalmaMove() {
  const pieces = Object.values(halmaState.pieces).filter(piece => piece.player === HALMA_COMPUTER_PLAYER);
  const moves = pieces.flatMap(piece => getLegalMovesForPiece(piece, false).map(move => ({ ...move, pieceId: piece.id })));

  if (!moves.length) {
    return null;
  }

  moves.sort((a, b) => getComputerMoveScore(b) - getComputerMoveScore(a));
  return moves[0];
}

function chooseBestComputerMoveForPiece(piece, jumpsOnly, blockedCells = new Set()) {
  const moves = getLegalMovesForPiece(piece, jumpsOnly)
    .filter(move => !blockedCells.has(`${move.row}-${move.col}`))
    .map(move => ({ ...move, pieceId: piece.id }));

  if (!moves.length) {
    return null;
  }

  moves.sort((a, b) => getComputerMoveScore(b) - getComputerMoveScore(a));
  return moves[0];
}

function getComputerMoveScore(move) {
  const piece = halmaState.pieces[move.pieceId];
  const before = getDistanceToGoal(piece.player, piece.row, piece.col);
  const after = getDistanceToGoal(piece.player, move.row, move.col);
  const jumpBonus = move.type === 'jump' ? 4 : 0;
  return before - after + jumpBonus;
}

function endHalmaGame(player) {
  halmaState.winner = player;
  halmaState.activeJumpPieceId = null;
  halmaState.computerThinking = false;

  let message = player === HALMA_HUMAN_PLAYER ? 'Sehr gut! Du hast gewonnen!' : 'Der Computer hat gewonnen.';
  if (halmaState.mode === HALMA_MODE_SOLO && player === HALMA_HUMAN_PLAYER) {
    const wasRecord = saveHalmaRecordIfBetter();
    message = wasRecord
      ? `Geschafft mit ${halmaState.turns} Zügen. Das ist ein neuer Rekord!`
      : `Geschafft mit ${halmaState.turns} Zügen.`;
  }

  saveHalmaState();
  renderHalmaBoard();
  updateHalmaStats();
  updateHalmaStatus(message);
}

function saveHalmaRecordIfBetter() {
  const records = loadHalmaRecords();
  const key = getHalmaRecordKey();
  const oldRecord = records[key];
  if (oldRecord && oldRecord <= halmaState.turns) {
    return false;
  }

  records[key] = halmaState.turns;
  localStorage.setItem(HALMA_RECORDS_KEY, JSON.stringify(records));
  return true;
}

function loadHalmaRecords() {
  try {
    return JSON.parse(localStorage.getItem(HALMA_RECORDS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function getHalmaRecordKey() {
  return `${halmaState.mode}-${halmaState.soloColors || 1}-${halmaState.boardShape}`;
}

function stopCarryingHalmaPiece() {
  halmaCarriedPiece = null;
  if (halmaFloatingPiece) {
    halmaFloatingPiece.remove();
    halmaFloatingPiece = null;
  }
}

function isLegalTarget(row, col) {
  if (!halmaCarriedPiece || getPieceAt(row, col)) {
    return false;
  }

  const piece = halmaState.pieces[halmaCarriedPiece.id];
  if (!piece) {
    return false;
  }

  return getLegalMoves(piece).some(move => move.row === row && move.col === col);
}

function getLegalMoves(piece) {
  return getLegalMovesForPiece(piece, Boolean(halmaState.activeJumpPieceId));
}

function getLegalMovesForPiece(piece, jumpsOnly) {
  const moves = [];

  HALMA_DIRECTIONS.forEach(([rowStep, colStep]) => {
    const stepRow = piece.row + rowStep;
    const stepCol = piece.col + colStep;
    const jumpRow = piece.row + rowStep * 2;
    const jumpCol = piece.col + colStep * 2;

    if (!jumpsOnly && isInsideBoard(stepRow, stepCol) && !getPieceAt(stepRow, stepCol)) {
      moves.push({ row: stepRow, col: stepCol, type: 'step' });
    }

    if (
      isInsideBoard(jumpRow, jumpCol) &&
      isInsideBoard(stepRow, stepCol) &&
      getPieceAt(stepRow, stepCol) &&
      !getPieceAt(jumpRow, jumpCol)
    ) {
      moves.push({ row: jumpRow, col: jumpCol, type: 'jump' });
    }
  });

  return moves;
}

function getHalmaMoveType(piece, row, col) {
  const move = getLegalMoves(piece).find(candidate => candidate.row === row && candidate.col === col);
  return move ? move.type : null;
}

function getPieceAt(row, col) {
  if (!halmaState) {
    return null;
  }

  return Object.values(halmaState.pieces).find(piece => piece.row === row && piece.col === col) || null;
}

function isHumanControlledPlayer(player) {
  if (halmaState.mode === HALMA_MODE_BOT) {
    return player === HALMA_HUMAN_PLAYER;
  }

  return getActiveHumanPlayers(getHalmaShape(), halmaState.mode, halmaState.soloColors).includes(player);
}

function getHalmaShape() {
  return HALMA_BOARD_SHAPES[halmaState?.boardShape] || HALMA_BOARD_SHAPES.klassisch;
}

function getStartCamp(shapeId, player) {
  const shape = HALMA_BOARD_SHAPES[shapeId] || HALMA_BOARD_SHAPES.klassisch;
  return [...(shape.start[player] || [])];
}

function getGoalCamp(player) {
  const shape = getHalmaShape();
  return [...(shape.goal[player] || [])];
}

function getAllBoardCells(shape = getHalmaShape()) {
  const cells = [];
  for (let row = 0; row < shape.size; row++) {
    for (let col = 0; col < shape.size; col++) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function isInsideBoard(row, col) {
  const shape = getHalmaShape();
  return row >= 0 &&
    row < shape.size &&
    col >= 0 &&
    col < shape.size &&
    isCellValidForShape(shape, row, col);
}

function isGoalCampCell(player, row, col) {
  return getGoalCamp(player).some(cell => cell.row === row && cell.col === col);
}

function isCellValidForShape(shape, row, col) {
  if (typeof shape.isCellValid === 'function') {
    return shape.isCellValid(row, col);
  }

  return row >= 0 && row < shape.size && col >= 0 && col < shape.size;
}

function getHalmaCampClasses(row, col) {
  return (getHalmaShape().camps || [])
    .filter(camp => camp.cells.some(cell => cell.row === row && cell.col === col))
    .map(camp => camp.className);
}

function hasPlayerWon(player) {
  if (halmaState.mode === HALMA_MODE_SOLO) {
    return getActiveHumanPlayers(getHalmaShape(), halmaState.mode, halmaState.soloColors).every(activePlayer => {
      const pieces = Object.values(halmaState.pieces).filter(piece => piece.player === activePlayer);
      return pieces.length > 0 && pieces.every(piece => isGoalCampCell(activePlayer, piece.row, piece.col));
    });
  }

  const pieces = Object.values(halmaState.pieces).filter(piece => piece.player === player);
  return pieces.every(piece => isGoalCampCell(player, piece.row, piece.col));
}

function getDistanceToGoal(player, row, col) {
  return Math.min(...getGoalCamp(player).map(cell => {
    return Math.abs(cell.row - row) + Math.abs(cell.col - col);
  }));
}

function getHalmaCellLabel(row, col, piece) {
  if (piece) {
    return `${getHalmaPlayerName(piece.player)} Figur auf Reihe ${row + 1}, Spalte ${col + 1}`;
  }

  return `Freies Feld Reihe ${row + 1}, Spalte ${col + 1}`;
}

function isBotThinkingTurn() {
  return halmaState?.mode === HALMA_MODE_BOT &&
    (halmaState.currentPlayer === HALMA_COMPUTER_PLAYER || halmaState.computerThinking);
}

function updateHalmaStats() {
  const moveCount = document.getElementById('halma-move-count');
  const record = document.getElementById('halma-record');

  if (moveCount && halmaState) {
    moveCount.textContent = String(halmaState.turns || 0);
  }

  if (record && halmaState) {
    const savedRecord = loadHalmaRecords()[getHalmaRecordKey()];
    record.textContent = halmaState.mode === HALMA_MODE_SOLO && savedRecord ? String(savedRecord) : '-';
  }
}

function updateHalmaStatus(message) {
  const status = document.getElementById('halma-status');
  if (!status || !halmaState) {
    return;
  }

  if (message) {
    status.textContent = message;
    return;
  }

  if (halmaState.winner) {
    status.textContent = halmaState.winner === HALMA_HUMAN_PLAYER ? 'Sehr gut! Du hast gewonnen!' : 'Der Computer hat gewonnen.';
    return;
  }

  if (isBotThinkingTurn()) {
    status.textContent = 'Der Computer ist dran.';
    return;
  }

  status.textContent = halmaState.mode === HALMA_MODE_SOLO
    ? (halmaState.soloColors > 1
      ? 'Bringe alle Farben in ihre passenden Zielbereiche.'
      : 'Bringe alle roten Figuren in die gegenüberliegende Ecke.')
    : 'Du bist Rot. Der Computer spielt Blau.';
}

function updateHalmaEndTurnButton() {
  const endTurnButton = document.getElementById('halma-end-turn-button');
  if (endTurnButton) {
    endTurnButton.hidden = !halmaState ||
      !halmaState.activeJumpPieceId ||
      isBotThinkingTurn() ||
      Boolean(halmaState.winner);
  }
}

function getHalmaPlayerName(player) {
  return HALMA_PLAYER_LABELS[player] || player;
}

function getHalmaPieceLetter(player) {
  return getHalmaPlayerName(player).charAt(0);
}
