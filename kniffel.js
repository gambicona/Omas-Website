const KNIFFEL_SAVE_KEY = 'omasKniffelSpiel';
const KNIFFEL_HUMAN = 'mensch';
const KNIFFEL_BOT = 'computer';
const KNIFFEL_UPPER_BONUS_TARGET = 63;
const KNIFFEL_UPPER_BONUS = 35;
const KNIFFEL_CATEGORIES = [
  { id: 'ones', label: 'Einser' },
  { id: 'twos', label: 'Zweier' },
  { id: 'threes', label: 'Dreier' },
  { id: 'fours', label: 'Vierer' },
  { id: 'fives', label: 'Fünfer' },
  { id: 'sixes', label: 'Sechser' },
  { id: 'threeKind', label: 'Dreierpasch' },
  { id: 'fourKind', label: 'Viererpasch' },
  { id: 'fullHouse', label: 'Full House' },
  { id: 'smallStraight', label: 'Kleine Straße' },
  { id: 'largeStraight', label: 'Große Straße' },
  { id: 'kniffel', label: 'Kniffel' },
  { id: 'chance', label: 'Chance' }
];
const KNIFFEL_UPPER_CATEGORIES = {
  1: 'ones',
  2: 'twos',
  3: 'threes',
  4: 'fours',
  5: 'fives',
  6: 'sixes'
};

let kniffelState = null;
let kniffelBotTimer = null;

function initKniffelPage() {
  const rollButton = document.getElementById('kniffel-roll-button');
  const newGameButton = document.getElementById('kniffel-new-game-button');
  if (!rollButton || !newGameButton) return;

  rollButton.addEventListener('click', rollKniffelDice);
  newGameButton.addEventListener('click', startNewKniffelGame);

  window.cleanupOmasDynamicPage = function () {
    window.clearTimeout(kniffelBotTimer);
  };

  kniffelState = loadKniffelState() || createNewKniffelState();
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus();
  if (isKniffelBotTurn()) scheduleKniffelBotTurn();
}

window.initKniffelPage = initKniffelPage;
document.addEventListener('DOMContentLoaded', initKniffelPage);

function createNewKniffelState() {
  return {
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    rollCount: 0,
    currentPlayer: KNIFFEL_HUMAN,
    scores: { mensch: {}, computer: {} },
    winner: null,
    botThinking: false
  };
}

function loadKniffelState() {
  try {
    const state = JSON.parse(localStorage.getItem(KNIFFEL_SAVE_KEY));
    if (!state || !state.scores || !state.dice) return null;
    state.botThinking = false;
    return state;
  } catch (error) {
    return null;
  }
}

function saveKniffelState() {
  localStorage.setItem(KNIFFEL_SAVE_KEY, JSON.stringify(kniffelState));
}

function startNewKniffelGame() {
  window.clearTimeout(kniffelBotTimer);
  kniffelState = createNewKniffelState();
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus('Neues Spiel gestartet. Du darfst würfeln.');
}

function renderKniffel() {
  renderKniffelDice();
  renderKniffelScoreboard();
  renderKniffelChoiceHint();
  updateKniffelStats();
}

function renderKniffelDice() {
  const diceBox = document.getElementById('kniffel-dice');
  if (!diceBox) return;
  diceBox.innerHTML = '';

  kniffelState.dice.forEach((value, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kniffel-die';
    button.textContent = String(value);
    button.disabled = kniffelState.rollCount === 0 || isKniffelBotTurn() || Boolean(kniffelState.winner);
    button.classList.toggle('held', kniffelState.held[index]);
    button.setAttribute('aria-label', `Würfel ${index + 1}: ${value}`);
    button.addEventListener('click', () => toggleKniffelHold(index));
    diceBox.appendChild(button);
  });
}

function renderKniffelScoreboard() {
  const board = document.getElementById('kniffel-scoreboard');
  if (!board) return;
  board.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'kniffel-score-row kniffel-score-header';
  header.innerHTML = '<span>Zeile</span><span>Du</span><span>Computer</span>';
  board.appendChild(header);

  KNIFFEL_CATEGORIES.forEach(category => {
    const row = document.createElement('div');
    row.className = 'kniffel-score-row';

    const label = document.createElement('span');
    label.textContent = category.label;

    const humanButton = document.createElement('button');
    const humanScore = kniffelState.scores.mensch[category.id];
    const rowIsSelectable = humanScore === undefined && kniffelState.rollCount > 0 && !isKniffelBotTurn() && !kniffelState.winner;
    humanButton.type = 'button';
    humanButton.textContent = humanScore === undefined ? getKniffelPreview(category.id) : String(humanScore);
    humanButton.disabled = !rowIsSelectable;
    humanButton.className = humanScore === undefined ? 'kniffel-open-score' : 'kniffel-fixed-score';
    humanButton.addEventListener('click', event => {
      event.stopPropagation();
      chooseKniffelCategory(category.id);
    });

    if (rowIsSelectable) {
      row.classList.add('kniffel-selectable-row');
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-label', `${category.label} wählen. Das gibt ${getKniffelPreview(category.id)} Punkte.`);
      row.addEventListener('click', () => chooseKniffelCategory(category.id));
      row.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseKniffelCategory(category.id);
        }
      });
    }

    const botScore = document.createElement('span');
    botScore.className = 'kniffel-score-value';
    botScore.textContent = kniffelState.scores.computer[category.id] === undefined ? '-' : String(kniffelState.scores.computer[category.id]);

    row.appendChild(label);
    row.appendChild(humanButton);
    row.appendChild(botScore);
    board.appendChild(row);
  });
}

function renderKniffelChoiceHint() {
  const hint = document.getElementById('kniffel-choice-hint');
  if (!hint) return;
  hint.textContent = getKniffelStepHintText();
  hint.hidden = false;
}

function getKniffelStepHintText() {
  if (kniffelState.winner) return 'Das Spiel ist fertig. Du kannst ein neues Spiel starten.';
  if (isKniffelBotTurn()) return 'Der Computer ist dran. Bitte kurz warten.';
  if (kniffelState.rollCount === 0) return 'Jetzt würfeln.';
  if (kniffelState.rollCount === 1) return 'Jetzt Würfel festhalten. Dann nochmal würfeln oder schon eine Zeile nehmen.';
  if (kniffelState.rollCount === 2) return 'Jetzt Würfel festhalten. Dann ein letztes Mal würfeln oder eine Zeile nehmen.';
  return 'Jetzt eine Zeile anklicken und die Punkte eintragen. Auch 0 Punkte sind erlaubt.';
}

function rollKniffelDice() {
  if (kniffelState.winner || isKniffelBotTurn() || kniffelState.rollCount >= 3) return;
  kniffelState.dice = kniffelState.dice.map((value, index) => kniffelState.held[index] ? value : randomDie());
  kniffelState.rollCount++;
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus(kniffelState.rollCount < 3 ? 'Du kannst nochmal würfeln oder eine Zeile wählen.' : 'Bitte eine Zeile wählen.');
}

function toggleKniffelHold(index) {
  kniffelState.held[index] = !kniffelState.held[index];
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus(kniffelState.held[index] ? 'Dieser Würfel bleibt liegen.' : 'Dieser Würfel wird wieder mitgewürfelt.');
}

function chooseKniffelCategory(categoryId) {
  if (kniffelState.rollCount === 0 || kniffelState.scores.mensch[categoryId] !== undefined) return;
  kniffelState.scores.mensch[categoryId] = scoreKniffelCategory(categoryId, kniffelState.dice);
  if (checkKniffelGameOver()) return;

  kniffelState.currentPlayer = KNIFFEL_BOT;
  kniffelState.botThinking = true;
  kniffelState.rollCount = 0;
  kniffelState.held = [false, false, false, false, false];
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus('Der Computer ist dran.');
  scheduleKniffelBotTurn();
}

function scheduleKniffelBotTurn() {
  window.clearTimeout(kniffelBotTimer);
  kniffelBotTimer = window.setTimeout(playKniffelBotTurn, 1200);
}

async function playKniffelBotTurn() {
  if (!isKniffelBotTurn() || kniffelState.winner) return;

  kniffelState.held = [false, false, false, false, false];
  for (let roll = 1; roll <= 3; roll++) {
    kniffelState.dice = kniffelState.dice.map((value, index) => kniffelState.held[index] ? value : randomDie());
    kniffelState.rollCount = roll;
    kniffelState.held = chooseKniffelBotHeldDice();
    saveKniffelState();
    renderKniffel();
    updateKniffelStatus(`Der Computer würfelt. Wurf ${roll} von 3.`);
    await waitKniffel(1600);
  }

  const categoryId = chooseKniffelBotCategory();
  kniffelState.scores.computer[categoryId] = scoreKniffelCategory(categoryId, kniffelState.dice);
  updateKniffelStatus(`Der Computer nimmt ${getKniffelCategoryLabel(categoryId)}.`);
  await waitKniffel(1800);

  if (checkKniffelGameOver()) return;
  kniffelState.currentPlayer = KNIFFEL_HUMAN;
  kniffelState.botThinking = false;
  kniffelState.rollCount = 0;
  kniffelState.held = [false, false, false, false, false];
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus('Du bist dran. Bitte würfeln.');
}

function chooseKniffelBotHeldDice() {
  const counts = countKniffelDice(kniffelState.dice);
  const bestNumber = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || b - a)[0];
  return kniffelState.dice.map(value => String(value) === String(bestNumber));
}

function chooseKniffelBotCategory() {
  const openCategories = KNIFFEL_CATEGORIES
    .map(category => category.id)
    .filter(id => kniffelState.scores.computer[id] === undefined);
  const counts = countKniffelDice(kniffelState.dice);
  const bestFourUpper = getBestKniffelUpperCategory(openCategories, counts, 4);
  const bestThreeUpper = getBestKniffelUpperCategory(openCategories, counts, 3);
  const priority = [
    scoreKniffelCategory('kniffel', kniffelState.dice) > 0 ? 'kniffel' : null,
    scoreKniffelCategory('largeStraight', kniffelState.dice) > 0 ? 'largeStraight' : null,
    scoreKniffelCategory('fourKind', kniffelState.dice) > 0 ? 'fourKind' : null,
    bestFourUpper,
    scoreKniffelCategory('smallStraight', kniffelState.dice) > 0 ? 'smallStraight' : null,
    scoreKniffelCategory('fullHouse', kniffelState.dice) > 0 ? 'fullHouse' : null,
    bestThreeUpper,
    scoreKniffelCategory('threeKind', kniffelState.dice) > 0 ? 'threeKind' : null
  ];

  const priorityMatch = priority.find(id => id && openCategories.includes(id));
  if (priorityMatch) return priorityMatch;

  return openCategories
    .map(id => ({ id, score: scoreKniffelCategory(id, kniffelState.dice) }))
    .sort((a, b) => b.score - a.score || getKniffelCategoryOrder(a.id) - getKniffelCategoryOrder(b.id))[0].id;
}

function getBestKniffelUpperCategory(openCategories, counts, minimumCount) {
  return [6, 5, 4, 3, 2, 1]
    .map(number => KNIFFEL_UPPER_CATEGORIES[number])
    .find(id => openCategories.includes(id) && (counts[getKniffelUpperNumber(id)] || 0) >= minimumCount) || null;
}

function getKniffelUpperNumber(categoryId) {
  return Number(Object.keys(KNIFFEL_UPPER_CATEGORIES).find(number => KNIFFEL_UPPER_CATEGORIES[number] === categoryId));
}

function getKniffelCategoryOrder(categoryId) {
  const index = KNIFFEL_CATEGORIES.findIndex(category => category.id === categoryId);
  return index === -1 ? 999 : index;
}

function scoreKniffelCategory(categoryId, dice) {
  const counts = countKniffelDice(dice);
  const sum = dice.reduce((total, value) => total + value, 0);
  const unique = [...new Set(dice)].sort((a, b) => a - b).join('');

  if (categoryId === 'ones') return sumNumber(dice, 1);
  if (categoryId === 'twos') return sumNumber(dice, 2);
  if (categoryId === 'threes') return sumNumber(dice, 3);
  if (categoryId === 'fours') return sumNumber(dice, 4);
  if (categoryId === 'fives') return sumNumber(dice, 5);
  if (categoryId === 'sixes') return sumNumber(dice, 6);
  if (categoryId === 'threeKind') return Object.values(counts).some(count => count >= 3) ? sum : 0;
  if (categoryId === 'fourKind') return Object.values(counts).some(count => count >= 4) ? sum : 0;
  if (categoryId === 'fullHouse') return Object.values(counts).includes(3) && Object.values(counts).includes(2) ? 25 : 0;
  if (categoryId === 'smallStraight') return ['1234', '2345', '3456'].some(run => run.split('').every(number => unique.includes(number))) ? 30 : 0;
  if (categoryId === 'largeStraight') return unique === '12345' || unique === '23456' ? 40 : 0;
  if (categoryId === 'kniffel') return Object.values(counts).some(count => count === 5) ? 50 : 0;
  if (categoryId === 'chance') return sum;
  return 0;
}

function countKniffelDice(dice) {
  return dice.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function sumNumber(dice, number) {
  return dice.filter(value => value === number).reduce((total, value) => total + value, 0);
}

function checkKniffelGameOver() {
  const humanDone = KNIFFEL_CATEGORIES.every(category => kniffelState.scores.mensch[category.id] !== undefined);
  const botDone = KNIFFEL_CATEGORIES.every(category => kniffelState.scores.computer[category.id] !== undefined);
  if (!humanDone || !botDone) {
    saveKniffelState();
    renderKniffel();
    return false;
  }

  const humanTotal = getKniffelTotal(KNIFFEL_HUMAN);
  const botTotal = getKniffelTotal(KNIFFEL_BOT);
  kniffelState.winner = humanTotal >= botTotal ? KNIFFEL_HUMAN : KNIFFEL_BOT;
  kniffelState.botThinking = false;
  saveKniffelState();
  renderKniffel();
  updateKniffelStatus(humanTotal >= botTotal ? 'Du hast gewonnen!' : 'Der Computer hat gewonnen.');
  return true;
}

function getKniffelPreview(categoryId) {
  if (kniffelState.rollCount === 0 || isKniffelBotTurn()) return '-';
  return String(scoreKniffelCategory(categoryId, kniffelState.dice));
}

function getKniffelTotal(player) {
  return Object.values(kniffelState.scores[player]).reduce((total, score) => total + score, 0) + getKniffelUpperBonus(player);
}

function getKniffelUpperTotal(player) {
  return Object.values(KNIFFEL_UPPER_CATEGORIES)
    .reduce((total, categoryId) => total + (kniffelState.scores[player][categoryId] || 0), 0);
}

function getKniffelUpperBonus(player) {
  return getKniffelUpperTotal(player) >= KNIFFEL_UPPER_BONUS_TARGET ? KNIFFEL_UPPER_BONUS : 0;
}

function getKniffelBonusInfoText() {
  const humanUpperTotal = getKniffelUpperTotal(KNIFFEL_HUMAN);
  const botUpperTotal = getKniffelUpperTotal(KNIFFEL_BOT);
  const humanMissing = Math.max(0, KNIFFEL_UPPER_BONUS_TARGET - humanUpperTotal);
  const botMissing = Math.max(0, KNIFFEL_UPPER_BONUS_TARGET - botUpperTotal);
  const humanText = humanMissing === 0 ? 'Du hast den Bonus.' : `Dir fehlen noch ${formatKniffelPoints(humanMissing)}.`;
  const botText = botMissing === 0 ? 'Computer hat den Bonus.' : `Computer fehlen noch ${formatKniffelPoints(botMissing)}.`;
  return `Bonus oben: ab ${KNIFFEL_UPPER_BONUS_TARGET} Punkten gibt es +${KNIFFEL_UPPER_BONUS}. ${humanText} ${botText}`;
}

function formatKniffelPoints(points) {
  return `${points} ${points === 1 ? 'Punkt' : 'Punkte'}`;
}

function updateKniffelStats() {
  const rollCount = document.getElementById('kniffel-roll-count');
  const humanTotal = document.getElementById('kniffel-human-total');
  const botTotal = document.getElementById('kniffel-bot-total');
  const bonusInfo = document.getElementById('kniffel-bonus-info');
  const rollButton = document.getElementById('kniffel-roll-button');
  if (rollCount) rollCount.textContent = String(kniffelState.rollCount);
  if (humanTotal) humanTotal.textContent = String(getKniffelTotal(KNIFFEL_HUMAN));
  if (botTotal) botTotal.textContent = String(getKniffelTotal(KNIFFEL_BOT));
  if (bonusInfo) bonusInfo.textContent = getKniffelBonusInfoText();
  if (rollButton) rollButton.disabled = isKniffelBotTurn() || kniffelState.rollCount >= 3 || Boolean(kniffelState.winner);
}

function updateKniffelStatus(message) {
  const status = document.getElementById('kniffel-status');
  if (!status) return;
  status.textContent = message || (isKniffelBotTurn() ? 'Der Computer ist dran.' : 'Bitte würfeln.');
}

function getKniffelCategoryLabel(categoryId) {
  return KNIFFEL_CATEGORIES.find(category => category.id === categoryId)?.label || 'eine Zeile';
}

function isKniffelBotTurn() {
  return kniffelState?.currentPlayer === KNIFFEL_BOT || kniffelState?.botThinking;
}

function randomDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function waitKniffel(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}
