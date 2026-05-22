const MUEHLE_SAVE_KEY = 'omasMuehleSpiel';
const MUEHLE_HUMAN = 'rot';
const MUEHLE_BOT = 'blau';
const MUEHLE_POINTS = [
  [0, 0], [3, 0], [6, 0],
  [1, 1], [3, 1], [5, 1],
  [2, 2], [3, 2], [4, 2],
  [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3],
  [2, 4], [3, 4], [4, 4],
  [1, 5], [3, 5], [5, 5],
  [0, 6], [3, 6], [6, 6]
];
const MUEHLE_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [9, 10, 11], [12, 13, 14],
  [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15],
  [1, 4, 7], [16, 19, 22],
  [8, 12, 17], [5, 13, 20], [2, 14, 23]
];
const MUEHLE_NEIGHBORS = {
  0: [1, 9], 1: [0, 2, 4], 2: [1, 14],
  3: [4, 10], 4: [1, 3, 5, 7], 5: [4, 13],
  6: [7, 11], 7: [4, 6, 8], 8: [7, 12],
  9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15],
  12: [8, 13, 17], 13: [5, 12, 14, 20], 14: [2, 13, 23],
  15: [11, 16], 16: [15, 17, 19], 17: [12, 16],
  18: [10, 19], 19: [16, 18, 20, 22], 20: [13, 19],
  21: [9, 22], 22: [19, 21, 23], 23: [14, 22]
};

let muehleState = null;
let selectedMuehlePoint = null;
let muehleBotTimer = null;

function initMuehlePage() {
  const board = document.getElementById('muehle-board');
  const newGameButton = document.getElementById('muehle-new-game-button');
  if (!board || !newGameButton) return;

  newGameButton.addEventListener('click', startNewMuehleGame);
  window.cleanupOmasDynamicPage = function () {
    window.clearTimeout(muehleBotTimer);
  };

  muehleState = loadMuehleState() || createNewMuehleState();
  saveMuehleState();
  renderMuehleBoard();
  updateMuehleStatus();

  if (isMuehleBotTurn()) scheduleMuehleBotMove();
}

window.initMuehlePage = initMuehlePage;
document.addEventListener('DOMContentLoaded', initMuehlePage);

function createNewMuehleState() {
  return {
    points: Array(24).fill(null),
    toPlace: { rot: 9, blau: 9 },
    currentPlayer: MUEHLE_HUMAN,
    removeMode: false,
    winner: null,
    botThinking: false
  };
}

function loadMuehleState() {
  try {
    const state = JSON.parse(localStorage.getItem(MUEHLE_SAVE_KEY));
    if (!state || !Array.isArray(state.points)) return null;
    state.botThinking = false;
    return state;
  } catch (error) {
    return null;
  }
}

function saveMuehleState() {
  localStorage.setItem(MUEHLE_SAVE_KEY, JSON.stringify(muehleState));
}

function startNewMuehleGame() {
  window.clearTimeout(muehleBotTimer);
  selectedMuehlePoint = null;
  muehleState = createNewMuehleState();
  saveMuehleState();
  renderMuehleBoard();
  updateMuehleStatus('Neues Spiel gestartet. Setze einen roten Stein.');
}

function renderMuehleBoard() {
  const board = document.getElementById('muehle-board');
  if (!board || !muehleState) return;
  board.innerHTML = createMuehleLinesSvg();

  MUEHLE_POINTS.forEach(([x, y], index) => {
    const button = document.createElement('button');
    const player = muehleState.points[index];
    button.type = 'button';
    button.className = 'muehle-point';
    button.style.left = `${(x / 6) * 100}%`;
    button.style.top = `${(y / 6) * 100}%`;
    button.disabled = isMuehleBotTurn() || Boolean(muehleState.winner);
    button.setAttribute('aria-label', getMuehlePointLabel(index));
    if (isMuehleLegalTarget(index)) button.classList.add('muehle-target');
    if (selectedMuehlePoint === index) button.classList.add('selected');
    if (player) {
      const stone = document.createElement('span');
      stone.className = `muehle-stone muehle-stone-${player}`;
      button.appendChild(stone);
    }
    button.addEventListener('click', () => handleMuehlePointClick(index));
    board.appendChild(button);
  });

  updateMuehleCounts();
}

function createMuehleLinesSvg() {
  const svgLines = [
    [[0,0],[6,0]], [[1,1],[5,1]], [[2,2],[4,2]],
    [[0,3],[2,3]], [[4,3],[6,3]],
    [[2,4],[4,4]], [[1,5],[5,5]], [[0,6],[6,6]],
    [[0,0],[0,6]], [[1,1],[1,5]], [[2,2],[2,4]],
    [[3,0],[3,2]], [[3,4],[3,6]],
    [[4,2],[4,4]], [[5,1],[5,5]], [[6,0],[6,6]]
  ].map(line => {
    return `<line x1="${line[0][0]}" y1="${line[0][1]}" x2="${line[1][0]}" y2="${line[1][1]}"></line>`;
  }).join('');
  return `<svg class="muehle-lines" viewBox="-0.35 -0.35 6.7 6.7" aria-hidden="true">${svgLines}</svg>`;
}

function handleMuehlePointClick(index) {
  if (muehleState.winner || isMuehleBotTurn()) return;

  if (muehleState.removeMode) {
    if (!canRemoveMuehleStone(index, MUEHLE_BOT)) {
      updateMuehleStatus('Diesen Stein kannst du nicht nehmen.');
      return;
    }
    muehleState.points[index] = null;
    muehleState.removeMode = false;
    finishMuehleHumanTurn();
    return;
  }

  if (muehleState.toPlace.rot > 0) {
    if (muehleState.points[index]) {
      updateMuehleStatus('Dieses Feld ist besetzt.');
      return;
    }
    muehleState.points[index] = MUEHLE_HUMAN;
    muehleState.toPlace.rot--;
    if (isMuehleAt(index, MUEHLE_HUMAN)) {
      muehleState.removeMode = true;
      saveMuehleState();
      renderMuehleBoard();
      updateMuehleStatus('Mühle! Nimm einen blauen Stein.');
      return;
    }
    finishMuehleHumanTurn();
    return;
  }

  if (selectedMuehlePoint === null) {
    if (muehleState.points[index] !== MUEHLE_HUMAN) {
      updateMuehleStatus('Bitte einen roten Stein wählen.');
      return;
    }
    selectedMuehlePoint = index;
    renderMuehleBoard();
    updateMuehleStatus('Stein gewählt. Klicke auf ein freies Zielfeld.');
    return;
  }

  if (selectedMuehlePoint === index) {
    selectedMuehlePoint = null;
    renderMuehleBoard();
    updateMuehleStatus('Stein abgewählt.');
    return;
  }

  if (!isMuehleMoveLegal(selectedMuehlePoint, index, MUEHLE_HUMAN)) {
    selectedMuehlePoint = null;
    renderMuehleBoard();
    updateMuehleStatus('Dieser Zug geht nicht.');
    return;
  }

  muehleState.points[selectedMuehlePoint] = null;
  muehleState.points[index] = MUEHLE_HUMAN;
  selectedMuehlePoint = null;
  if (isMuehleAt(index, MUEHLE_HUMAN)) {
    muehleState.removeMode = true;
    saveMuehleState();
    renderMuehleBoard();
    updateMuehleStatus('Mühle! Nimm einen blauen Stein.');
    return;
  }
  finishMuehleHumanTurn();
}

function finishMuehleHumanTurn() {
  if (checkMuehleWinner()) return;
  muehleState.currentPlayer = MUEHLE_BOT;
  muehleState.botThinking = true;
  saveMuehleState();
  renderMuehleBoard();
  updateMuehleStatus('Der Computer denkt kurz.');
  scheduleMuehleBotMove();
}

function scheduleMuehleBotMove() {
  window.clearTimeout(muehleBotTimer);
  muehleBotTimer = window.setTimeout(playMuehleBotTurn, 700);
}

function playMuehleBotTurn() {
  if (!isMuehleBotTurn() || muehleState.winner) return;
  let placedOrMovedIndex = null;

  if (muehleState.toPlace.blau > 0) {
    placedOrMovedIndex = chooseMuehleBotPlacement();
    muehleState.points[placedOrMovedIndex] = MUEHLE_BOT;
    muehleState.toPlace.blau--;
  } else {
    const move = chooseMuehleBotMove();
    if (!move) {
      muehleState.winner = MUEHLE_HUMAN;
      finishMuehleBotTurn('Du hast gewonnen!');
      return;
    }
    muehleState.points[move.from] = null;
    muehleState.points[move.to] = MUEHLE_BOT;
    placedOrMovedIndex = move.to;
  }

  if (isMuehleAt(placedOrMovedIndex, MUEHLE_BOT)) {
    const removeIndex = chooseMuehleRemoveIndex(MUEHLE_HUMAN);
    if (removeIndex !== null) {
      muehleState.points[removeIndex] = null;
    }
  }

  finishMuehleBotTurn('Du bist dran.');
}

function finishMuehleBotTurn(message) {
  if (!muehleState.winner && checkMuehleWinner()) return;
  muehleState.currentPlayer = MUEHLE_HUMAN;
  muehleState.botThinking = false;
  saveMuehleState();
  renderMuehleBoard();
  updateMuehleStatus(message);
}

function chooseMuehleBotPlacement() {
  const empty = getEmptyMuehlePoints();
  const winning = empty.find(index => wouldMakeMuehle(index, MUEHLE_BOT));
  if (winning !== undefined) return winning;
  const blocking = empty.find(index => wouldMakeMuehle(index, MUEHLE_HUMAN));
  if (blocking !== undefined) return blocking;
  return empty.includes(4) ? 4 : empty[Math.floor(empty.length / 2)];
}

function chooseMuehleBotMove() {
  const moves = getAllMuehleMoves(MUEHLE_BOT);
  const winning = moves.find(move => {
    const copy = [...muehleState.points];
    copy[move.from] = null;
    copy[move.to] = MUEHLE_BOT;
    return MUEHLE_LINES.some(line => line.includes(move.to) && line.every(index => copy[index] === MUEHLE_BOT));
  });
  return winning || moves[0] || null;
}

function getAllMuehleMoves(player) {
  const pieceCount = countMuehlePieces(player);
  const canFly = pieceCount === 3;
  const empty = getEmptyMuehlePoints();
  const moves = [];
  muehleState.points.forEach((pointPlayer, index) => {
    if (pointPlayer !== player) return;
    const targets = canFly ? empty : MUEHLE_NEIGHBORS[index].filter(target => !muehleState.points[target]);
    targets.forEach(target => moves.push({ from: index, to: target }));
  });
  return moves;
}

function isMuehleMoveLegal(from, to, player) {
  if (muehleState.points[to]) return false;
  if (countMuehlePieces(player) === 3) return true;
  return MUEHLE_NEIGHBORS[from].includes(to);
}

function isMuehleLegalTarget(index) {
  if (muehleState.removeMode) return canRemoveMuehleStone(index, MUEHLE_BOT);
  if (muehleState.toPlace.rot > 0) return !muehleState.points[index];
  if (selectedMuehlePoint === null) return false;
  return isMuehleMoveLegal(selectedMuehlePoint, index, MUEHLE_HUMAN);
}

function isMuehleAt(index, player) {
  return MUEHLE_LINES.some(line => line.includes(index) && line.every(point => muehleState.points[point] === player));
}

function wouldMakeMuehle(index, player) {
  const old = muehleState.points[index];
  muehleState.points[index] = player;
  const result = isMuehleAt(index, player);
  muehleState.points[index] = old;
  return result;
}

function canRemoveMuehleStone(index, player) {
  if (muehleState.points[index] !== player) return false;
  const removable = getRemovableMuehleStones(player);
  return removable.includes(index);
}

function getRemovableMuehleStones(player) {
  const stones = muehleState.points.map((pointPlayer, index) => pointPlayer === player ? index : null).filter(index => index !== null);
  const outsideMills = stones.filter(index => !isMuehleAt(index, player));
  return outsideMills.length ? outsideMills : stones;
}

function chooseMuehleRemoveIndex(player) {
  const removable = getRemovableMuehleStones(player);
  return removable[0] ?? null;
}

function checkMuehleWinner() {
  if (muehleState.toPlace.rot > 0 || muehleState.toPlace.blau > 0) return false;
  const humanCount = countMuehlePieces(MUEHLE_HUMAN);
  const botCount = countMuehlePieces(MUEHLE_BOT);
  if (humanCount < 3) muehleState.winner = MUEHLE_BOT;
  if (botCount < 3) muehleState.winner = MUEHLE_HUMAN;
  if (!muehleState.winner && !getAllMuehleMoves(MUEHLE_HUMAN).length) muehleState.winner = MUEHLE_BOT;
  if (!muehleState.winner && !getAllMuehleMoves(MUEHLE_BOT).length) muehleState.winner = MUEHLE_HUMAN;
  if (!muehleState.winner) return false;
  muehleState.botThinking = false;
  saveMuehleState();
  renderMuehleBoard();
  updateMuehleStatus(muehleState.winner === MUEHLE_HUMAN ? 'Du hast gewonnen!' : 'Der Computer hat gewonnen.');
  return true;
}

function getEmptyMuehlePoints() {
  return muehleState.points.map((player, index) => player ? null : index).filter(index => index !== null);
}

function countMuehlePieces(player) {
  return muehleState.points.filter(pointPlayer => pointPlayer === player).length;
}

function isMuehleBotTurn() {
  return muehleState?.currentPlayer === MUEHLE_BOT || muehleState?.botThinking;
}

function updateMuehleCounts() {
  const toPlace = document.getElementById('muehle-to-place');
  const humanCount = document.getElementById('muehle-human-count');
  const botCount = document.getElementById('muehle-bot-count');
  if (toPlace) toPlace.textContent = String(muehleState.toPlace.rot);
  if (humanCount) humanCount.textContent = String(countMuehlePieces(MUEHLE_HUMAN));
  if (botCount) botCount.textContent = String(countMuehlePieces(MUEHLE_BOT));
}

function updateMuehleStatus(message) {
  const status = document.getElementById('muehle-status');
  if (!status) return;
  if (message) {
    status.textContent = message;
    return;
  }
  if (muehleState.removeMode) {
    status.textContent = 'Mühle! Nimm einen blauen Stein.';
    return;
  }
  status.textContent = isMuehleBotTurn() ? 'Der Computer ist dran.' : (muehleState.toPlace.rot > 0 ? 'Setze einen roten Stein.' : 'Bewege einen roten Stein.');
}

function getMuehlePointLabel(index) {
  const player = muehleState.points[index];
  if (!player) return `Freier Punkt ${index + 1}`;
  return player === MUEHLE_HUMAN ? 'Roter Stein' : 'Blauer Stein';
}
