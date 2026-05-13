// memory.js

const MEMORY_GRID_CONFIG = {
  6: { columns: 3, rows: 2 },
  8: { columns: 4, rows: 2 },
  12: { columns: 4, rows: 3 },
  16: { columns: 4, rows: 4 },
  20: { columns: 5, rows: 4 },
  24: { columns: 6, rows: 4 }
};

const MEMORY_SETS = {
  flowers: {
    label: 'Blumen',
    values: [
      {
        id: 'blume-01',
        image: 'images/memory/bild-01.png',
        alt: 'Blume 1'
      },
      {
        id: 'blume-02',
        image: 'images/memory/bild-02.png',
        alt: 'Blume 2'
      },
      {
        id: 'blume-03',
        image: 'images/memory/bild-03.png',
        alt: 'Blume 3'
      },
      {
        id: 'blume-04',
        image: 'images/memory/bild-04.png',
        alt: 'Blume 4'
      },
      {
        id: 'blume-05',
        image: 'images/memory/bild-05.png',
        alt: 'Blume 5'
      },
      {
        id: 'blume-06',
        image: 'images/memory/bild-06.png',
        alt: 'Blume 6'
      },
      {
        id: 'blume-07',
        image: 'images/memory/bild-07.png',
        alt: 'Blume 7'
      },
      {
        id: 'blume-08',
        image: 'images/memory/bild-08.png',
        alt: 'Blume 8'
      },
      {
        id: 'blume-09',
        image: 'images/memory/bild-09.png',
        alt: 'Blume 9'
      },
      {
        id: 'blume-10',
        image: 'images/memory/bild-10.png',
        alt: 'Blume 10'
      },
      {
        id: 'blume-11',
        image: 'images/memory/bild-11.png',
        alt: 'Blume 11'
      },
      {
        id: 'blume-12',
        image: 'images/memory/bild-12.png',
        alt: 'Blume 12'
      }
    ]
  },

  animals: {
    label: 'Tiere',
    values: [
      {
        id: 'tier-01',
        image: 'images/memory/bild-13.png',
        alt: 'Tier 1'
      },
      {
        id: 'tier-02',
        image: 'images/memory/bild-14.png',
        alt: 'Tier 2'
      },
      {
        id: 'tier-03',
        image: 'images/memory/bild-15.png',
        alt: 'Tier 3'
      },
      {
        id: 'tier-04',
        image: 'images/memory/bild-16.png',
        alt: 'Tier 4'
      },
      {
        id: 'tier-05',
        image: 'images/memory/bild-17.png',
        alt: 'Tier 5'
      },
      {
        id: 'tier-06',
        image: 'images/memory/bild-18.png',
        alt: 'Tier 6'
      },
      {
        id: 'tier-07',
        image: 'images/memory/bild-19.png',
        alt: 'Tier 7'
      },
      {
        id: 'tier-08',
        image: 'images/memory/bild-20.png',
        alt: 'Tier 8'
      },
      {
        id: 'tier-09',
        image: 'images/memory/bild-21.png',
        alt: 'Tier 9'
      },
      {
        id: 'tier-10',
        image: 'images/memory/bild-22.png',
        alt: 'Tier 10'
      },
      {
        id: 'tier-11',
        image: 'images/memory/bild-23.png',
        alt: 'Tier 11'
      },
      {
        id: 'tier-12',
        image: 'images/memory/bild-24.png',
        alt: 'Tier 12'
      }
    ]
  }
};

let memoryCards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let moveCount = 0;
let currentCardCount = 0;
let currentMemorySet = 'flowers';

function initMemoryPage() {
  const sizeButtons = document.querySelectorAll('.memory-size-buttons button');
  const setButtons = document.querySelectorAll('.memory-set-buttons button');
  const newGameButton = document.getElementById('memory-new-game-button');

  if (!sizeButtons.length || !setButtons.length || !newGameButton) {
    return;
  }

  setButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentMemorySet = button.dataset.memorySet;

      setButtons.forEach(otherButton => {
        otherButton.classList.toggle(
          'active',
          otherButton.dataset.memorySet === currentMemorySet
        );
      });

      const setLabel = MEMORY_SETS[currentMemorySet].label;

      if (currentCardCount > 0) {
        startMemoryGame(currentCardCount);
        return;
      }

      clearMemoryBoard(false);
      updateMemoryStatus(`${setLabel} ausgewählt. Bitte eine Kartenanzahl wählen.`);
    });
  });

  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const cardCount = Number(button.dataset.cardCount);
      startMemoryGame(cardCount);
    });
  });

  newGameButton.addEventListener('click', () => {
    if (currentCardCount > 0) {
      startMemoryGame(currentCardCount);
    }
  });
}

window.initMemoryPage = initMemoryPage;
document.addEventListener('DOMContentLoaded', initMemoryPage);
function startMemoryGame(cardCount) {
  const config = MEMORY_GRID_CONFIG[cardCount];

  if (!config) {
    return;
  }

  currentCardCount = cardCount;
  updateCardCountButtons();
  matchedPairs = 0;
  moveCount = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  memoryCards = createMemoryDeck(cardCount);
  if (memoryCards.length === 0) {
    return;
    }

  const board = document.getElementById('memory-board');
  board.style.setProperty('--memory-columns', config.columns);
  board.innerHTML = '';

  memoryCards.forEach((card, index) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'memory-card';
    button.dataset.index = index;
    button.textContent = '?';
    button.setAttribute('aria-label', 'Verdeckte Karte');
    button.addEventListener('click', () => handleMemoryCardClick(index));

    board.appendChild(button);
  });

  document.getElementById('memory-new-game-button').hidden = false;
  const setLabel = MEMORY_SETS[currentMemorySet].label;

    updateMemoryStatus(
    `${setLabel}: Spiel mit ${cardCount} Karten gestartet. Finde die gleichen Paare.`
    );
}
function updateCardCountButtons() {
  const sizeButtons = document.querySelectorAll('.memory-size-buttons button');

  sizeButtons.forEach(button => {
    const buttonCardCount = Number(button.dataset.cardCount);

    button.classList.toggle(
      'active',
      buttonCardCount === currentCardCount
    );
  });
}
function createMemoryDeck(cardCount) {
  const pairCount = cardCount / 2;
  const selectedSet = MEMORY_SETS[currentMemorySet];

  if (!selectedSet || selectedSet.values.length < pairCount) {
    updateMemoryStatus('FÃ¼r dieses Motiv gibt es noch nicht genug Bilder.');
    return [];
  }

  const selectedValues = shuffleArray(selectedSet.values).slice(0, pairCount);
  const deck = [];

  selectedValues.forEach(value => {
    deck.push({
      id: value.id,
      image: value.image,
      alt: value.alt,
      flipped: false,
      matched: false
    });

    deck.push({
      id: value.id,
      image: value.image,
      alt: value.alt,
      flipped: false,
      matched: false
    });
  });

  return shuffleArray(deck);
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temporary = copy[i];

    copy[i] = copy[randomIndex];
    copy[randomIndex] = temporary;
  }

  return copy;
}

function handleMemoryCardClick(index) {
  if (lockBoard) {
    return;
  }

  const card = memoryCards[index];
  const cardButton = getCardButton(index);

  if (!card || !cardButton || card.flipped || card.matched) {
    return;
  }

  revealCard(index);

  if (!firstCard) {
    firstCard = { index, id: card.id };
    updateMemoryStatus('Erste Karte aufgedeckt. WÃ¤hle eine zweite Karte.');
    return;
  }

  secondCard = { index, id: card.id };
  moveCount++;

  checkMemoryPair();
}

function revealCard(index) {
  const card = memoryCards[index];
  const cardButton = getCardButton(index);

  card.flipped = true;
  cardButton.textContent = '';
  cardButton.classList.add('flipped');

  const image = document.createElement('img');
  image.src = card.image;
  image.alt = card.alt;
  image.className = 'memory-card-image';

  cardButton.appendChild(image);
  cardButton.setAttribute('aria-label', card.alt);
}

function hideCard(index) {
  const card = memoryCards[index];
  const cardButton = getCardButton(index);

  card.flipped = false;
  cardButton.innerHTML = '?';
  cardButton.classList.remove('flipped');
  cardButton.setAttribute('aria-label', 'Verdeckte Karte');
}

function checkMemoryPair() {
  if (!firstCard || !secondCard) {
    return;
  }

  if (firstCard.id === secondCard.id) {
    markPairAsMatched();
    return;
  }

  lockBoard = true;
  updateMemoryStatus('Nicht gleich. Die Karten drehen sich gleich wieder um.');

  setTimeout(() => {
    hideCard(firstCard.index);
    hideCard(secondCard.index);
    resetSelectedCards();
    lockBoard = false;
    updateMemoryStatus('Versuche es noch einmal.');
  }, 3000);
}

function markPairAsMatched() {
  memoryCards[firstCard.index].matched = true;
  memoryCards[secondCard.index].matched = true;

  const firstButton = getCardButton(firstCard.index);
  const secondButton = getCardButton(secondCard.index);

  firstButton.classList.add('matched');
  secondButton.classList.add('matched');

  matchedPairs++;

  resetSelectedCards();

  const totalPairs = currentCardCount / 2;

  if (matchedPairs === totalPairs) {
    updateMemoryStatus(`Sehr gut! Alle Paare gefunden. ZÃ¼ge: ${moveCount}.`);
    return;
  }

  updateMemoryStatus(`Gut gemacht! Gefundene Paare: ${matchedPairs} von ${totalPairs}.`);
}

function resetSelectedCards() {
  firstCard = null;
  secondCard = null;
}

function getCardButton(index) {
  return document.querySelector(`.memory-card[data-index="${index}"]`);
}

function updateMemoryStatus(message) {
  const status = document.getElementById('memory-status');

  if (status) {
    status.textContent = message;
  }
}

function clearMemoryBoard(resetCardCount = true) {
  const board = document.getElementById('memory-board');
  const newGameButton = document.getElementById('memory-new-game-button');

  memoryCards = [];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedPairs = 0;
  moveCount = 0;

  if (resetCardCount) {
    currentCardCount = 0;
    updateCardCountButtons();
  }

  if (board) {
    board.innerHTML = '';
  }

  if (newGameButton) {
    newGameButton.hidden = true;
  }
}