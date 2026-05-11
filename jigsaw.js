// jigsaw.js

const JIGSAW_JIGGINESS = 0.22;
const JIGSAW_SNAP_GRACE = 0.6;
let currentTrayOrder = [];

const JIGSAW_SIZE_OPTIONS = {
  9: { cols: 3, rows: 3 },
  12: { cols: 4, rows: 3 },
  16: { cols: 4, rows: 4 },
  20: { cols: 5, rows: 4 },
  24: { cols: 6, rows: 4 },
  30: { cols: 6, rows: 5 },
  36: { cols: 6, rows: 6 },
  48: { cols: 8, rows: 6 }
};

const JIGSAW_PICTURE_CATEGORIES = {
  landscape: {
    label: 'Landschaft',
    pictures: [
      {
        id: 'landschaft-unterwelt',
        title: 'Magische Unterwelt',
        src: 'images/jigsaw/Magische Unterwelt.png'
      },
      {
        id: 'landschaft-glutburg',
        title: 'Glutburg',
        src: 'images/jigsaw/Glutburg.png'
      },
      {
        id: 'landschaft-Himmelsland',
        title: 'Himmelsland',
        src: 'images/jigsaw/Himmelsland.png'
      },
      {
        id: 'landschaft-Dschungeltempel',
        title: 'Dschungeltempel',
        src: 'images/jigsaw/Dschungeltempel.png'
      },
      {
        id: 'landschaft-Wüstenoase',
        title: 'Wüstenoase',
        src: 'images/jigsaw/Wüstenoase.png'
      },
      {
        id: 'landschaft-Herbstschloss',
        title: 'Herbstschloss',
        src: 'images/jigsaw/Herbstschloss.png'
      },
      {
        id: 'landschaft-Frostburg',
        title: 'Frostburg',
        src: 'images/jigsaw/Frostburg.png'
      },
      {
        id: 'landschaft-Pilzreich',
        title: 'Pilzreich',
        src: 'images/jigsaw/Pilzreich.png'
      },
      {
        id: 'landschaft-BaldursTor',
        title: 'Baldurs Tor',
        src: 'images/jigsaw/Baldurs Tor.png'
      },
      {
        id: 'landschaft-DieReise',
        title: 'Die Reise',
        src: 'images/jigsaw/Die Reise.png'
      }

      
    ]
  },

  animals: {
    label: 'Tiere',
    pictures: [
      
      {
      id: 'tier-ente',
      title: 'Ente',
      src: 'images/memory/bild-13.png'
      },
      {
      id: 'tier-hase',
      title: 'Hase',
      src: 'images/memory/bild-14.png'
      },
      {
      id: 'tier-Fuchs',
      title: 'Fuchs',
      src: 'images/memory/bild-15.png'
      },
      {
      id: 'tier-Panda',
      title: 'Panda',
      src: 'images/memory/bild-16.png'
      },
      {
      id: 'tier-Koala',
      title: 'Koala',
      src: 'images/memory/bild-17.png'
      },
      {
      id: 'tier-Reh',
      title: 'Reh',
      src: 'images/memory/bild-18.png'
      },
      {
      id: 'tier-Vogel',
      title: 'Vogel',
      src: 'images/memory/bild-19.png'
      },
      {
      id: 'tier-Robbe',
      title: 'Robbe',
      src: 'images/memory/bild-20.png'
      },
      {
      id: 'tier-Katze',
      title: 'Katze',
      src: 'images/memory/bild-21.png'
      },
      {
      id: 'tier-Igel',
      title: 'Igel',
      src: 'images/memory/bild-22.png'
      },
      {
      id: 'tier-Pinguin',
      title: 'Pinguin',
      src: 'images/memory/bild-23.png'
      },
      {
      id: 'tier-Elefant',
      title: 'Elefant',
      src: 'images/memory/bild-24.png'
      }
    ]
  },

  flowers: {
    label: 'Blumen',
    pictures: [
      {
        id: 'blumen-prachtscharte',
        title: 'Prachtscharte',
        src: 'images/jigsaw/Prachtscharte.png'
      },
      {
        id: 'blumen-Spinnenblume',
        title: 'Spinnenblume',
        src: 'images/jigsaw/Spinnenblume.png'
      },
      {
        id: 'blumen-Mädchenauge',
        title: 'Mädchenauge',
        src: 'images/jigsaw/Mädchenauge.png'
      },
      {
        id: 'blumen-Schachbrettblume',
        title: 'Schachbrettblume',
        src: 'images/jigsaw/Schachbrettblume.png'
      },
      {
        id: 'blumen-Fuchsschwanz-Amaranth',
        title: 'Fuchsschwanz-Amaranth',
        src: 'images/jigsaw/Fuchsschwanz-Amaranth.png'
      },
      {
        id: 'blumen-Sterndolde',
        title: 'Sterndolde',
        src: 'images/jigsaw/Sterndolde.png'
      },
      {
        id: 'blumen-Skabiose',
        title: 'Skabiose',
        src: 'images/jigsaw/Skabiose.png'
      },
      {
        id: 'blumen-Schmuckkörbchen',
        title: 'Schmuckkörbchen',
        src: 'images/jigsaw/Schmuckkörbchen.png'
      },
      {
        id: 'blumen-Akelei',
        title: 'Akelei',
        src: 'images/jigsaw/Akelei.png'
      },
      {
        id: 'blumen-TränendesHerz',
        title: 'Tränendes Herz',
        src: 'images/jigsaw/TränendesHerz.png'
      }
    ]
  },

  photos: {
    label: 'Fotos',
    pictures: [
     {
  id: 'foto-trio',
  title: 'Das alte Trio',
  src: 'images/jigsaw/Das (alte) Trio.jpg'
},
{
  id: 'foto-balu',
  title: 'Balu',
  src: 'images/jigsaw/Balu.jpg'
},
{
  id: 'foto-jarlar1',
  title: 'JarJar 1',
  src: 'images/jigsaw/JarJar1.jpg'
},
{
  id: 'foto-jarlar2',
  title: 'JarJar 2',
  src: 'images/jigsaw/JarJar2.jpg'
},
{
  id: 'foto-jarJar3',
  title: 'JarJar 3',
  src: 'images/jigsaw/JarJar3.jpg'
},
{
  id: 'foto-jarJarjung',
  title: 'JarJar jung',
  src: 'images/jigsaw/JarJarjung.jpg'
},
{
  id: 'foto-julia-baby',
  title: 'Julia Baby',
  src: 'images/jigsaw/Julia Baby.jpg'
},
{
  id: 'foto-julia-und-jarJar',
  title: 'Julia und JarJar',
  src: 'images/jigsaw/Julia und JarJar.jpg'
},
{
  id: 'foto-manchita',
  title: 'Manchita',
  src: 'images/jigsaw/Manchita.jpg'
},
{
  id: 'foto-mittelalter-julia',
  title: 'Mittelalter Julia',
  src: 'images/jigsaw/Mittelalter-Julia.JPG'
},
{
  id: 'foto-papa',
  title: 'Papa',
  src: 'images/jigsaw/Papa.jpg'
},
{
  id: 'foto-vroni1',
  title: 'Vroni 1',
  src: 'images/jigsaw/Vroni1.jpg'
},
{
  id: 'foto-vroni2',
  title: 'Vroni 2',
  src: 'images/jigsaw/Vroni2.jpg'
}
    ]
  }
};

let selectedPictureCategory = 'landscape';
let selectedPictureId = JIGSAW_PICTURE_CATEGORIES.landscape.pictures[0].id;
let selectedPieceCount = 9;

let currentPuzzle = null;
let currentImageSrc = '';
let currentPlacedPieces = new Set();
let currentCarryingPiece = null;
let currentFloatingPieceElement = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCategoryButtons();
  renderPictureButtons();
  renderSizeButtons();

  document.getElementById('jigsaw-start-button').addEventListener('click', startJigsawGame);

  document.getElementById('jigsaw-shadow-toggle').addEventListener('change', () => {
    updateShadowVisibility();
  });

  document.addEventListener('pointermove', moveFloatingPiece);
  document.addEventListener('click', handleJigsawDrop);
});

function createTemplatePicture() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f9d6e8"/>
          <stop offset="50%" stop-color="#dbefff"/>
          <stop offset="100%" stop-color="#fff3c4"/>
        </linearGradient>
        <linearGradient id="hill" x1="0" x2="1">
          <stop offset="0%" stop-color="#7ccf9b"/>
          <stop offset="100%" stop-color="#4fae7c"/>
        </linearGradient>
      </defs>

      <rect width="900" height="600" fill="url(#bg)"/>
      <circle cx="720" cy="120" r="70" fill="#fff2a8"/>
      <path d="M0 440 C140 340 270 420 400 330 C560 220 710 340 900 250 L900 600 L0 600 Z" fill="url(#hill)"/>
      <path d="M0 500 C160 440 280 510 420 430 C570 350 710 450 900 380 L900 600 L0 600 Z" fill="#66b98c"/>

      <circle cx="245" cy="255" r="82" fill="#ff9cc2"/>
      <circle cx="205" cy="255" r="52" fill="#ffc1d9"/>
      <circle cx="285" cy="255" r="52" fill="#ffc1d9"/>
      <circle cx="245" cy="215" r="52" fill="#ffd2e4"/>
      <circle cx="245" cy="295" r="52" fill="#f58db9"/>
      <circle cx="245" cy="255" r="32" fill="#ffd35c"/>

      <rect x="560" y="285" width="120" height="170" rx="20" fill="#b78a5c"/>
      <polygon points="520,305 620,210 720,305" fill="#df6f6f"/>
      <rect x="600" y="365" width="38" height="90" rx="8" fill="#6d4b35"/>
      <rect x="580" y="320" width="35" height="35" fill="#d9efff"/>
      <rect x="645" y="320" width="35" height="35" fill="#d9efff"/>

      <path d="M110 130 C160 80 210 80 260 130" stroke="#ffffff" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M610 120 C660 70 710 70 760 120" stroke="#ffffff" stroke-width="20" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderCategoryButtons() {
  const container = document.getElementById('jigsaw-category-buttons');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  Object.entries(JIGSAW_PICTURE_CATEGORIES).forEach(([categoryId, category]) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = category.label;
    button.dataset.categoryId = categoryId;
    button.classList.toggle('active', categoryId === selectedPictureCategory);

    button.addEventListener('click', () => {
      selectedPictureCategory = categoryId;

      const firstPicture = getPicturesForSelectedCategory()[0];
      selectedPictureId = firstPicture ? firstPicture.id : '';

      renderCategoryButtons();
      renderPictureButtons();

      if (firstPicture) {
        updateJigsawStatus(`${category.label} ausgewählt. Bitte ein Bild wählen oder direkt starten.`);
      } else {
        updateJigsawStatus(`${category.label} ausgewählt. In dieser Kategorie sind noch keine Bilder eingetragen.`);
      }
    });

    container.appendChild(button);
  });
}

function renderPictureButtons() {
  const container = document.getElementById('jigsaw-picture-buttons');
  container.innerHTML = '';

  const pictures = getPicturesForSelectedCategory();

  if (pictures.length === 0) {
    const message = document.createElement('p');
    message.className = 'jigsaw-empty-category-message';
    message.textContent = 'Für diese Kategorie sind noch keine Bilder eingetragen.';
    container.appendChild(message);
    return;
  }

  pictures.forEach(picture => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = picture.title;
    button.dataset.pictureId = picture.id;
    button.classList.toggle('active', picture.id === selectedPictureId);

    button.addEventListener('click', () => {
      selectedPictureId = picture.id;
      renderPictureButtons();
      updateJigsawStatus(`Bild "${picture.title}" ausgewählt.`);
    });

    container.appendChild(button);
  });
}

function getPicturesForSelectedCategory() {
  const category = JIGSAW_PICTURE_CATEGORIES[selectedPictureCategory];

  if (!category || !category.pictures) {
    return [];
  }

  return category.pictures;
}


function renderSizeButtons() {
  const container = document.getElementById('jigsaw-size-buttons');
  container.innerHTML = '';

  Object.keys(JIGSAW_SIZE_OPTIONS).forEach(pieceCount => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = pieceCount;
    button.dataset.pieceCount = pieceCount;
    button.classList.toggle('active', Number(pieceCount) === selectedPieceCount);

    button.addEventListener('click', () => {
      selectedPieceCount = Number(pieceCount);
      renderSizeButtons();
      updateJigsawStatus(`${pieceCount} Teile ausgewählt.`);
    });

    container.appendChild(button);
  });
}

async function startJigsawGame() {
  stopCarryingPiece();

  const picture = getSelectedPicture();
  const grid = JIGSAW_SIZE_OPTIONS[selectedPieceCount];

  if (!picture || !grid) {
    updateJigsawStatus('Bitte zuerst ein Bild und eine Teileanzahl auswählen.');
    return;
  }

  const image = await loadImage(picture.src);
  const puzzleSize = getPuzzleSizeForImage(image);

  currentImageSrc = picture.src;
  currentPlacedPieces = new Set();

  currentPuzzle = JigsawGenerator.generate({
    cols: grid.cols,
    rows: grid.rows,
    width: puzzleSize.width,
    height: puzzleSize.height,
    seed: `${picture.id}-${selectedPieceCount}`,
    jigginess: JIGSAW_JIGGINESS
  });
  currentTrayOrder = shuffleArray(currentPuzzle.pieces.map(piece => piece.id));

  document.getElementById('jigsaw-play-area').hidden = false;

  buildJigsawBoard();
  buildJigsawTray();

  updateJigsawStatus(`Puzzle gestartet: ${picture.title}, ${selectedPieceCount} Teile.`);
}

function getSelectedPicture() {
  return getPicturesForSelectedCategory()
    .find(picture => picture.id === selectedPictureId) || null;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function getPuzzleSizeForImage(image) {
  const maxWidth = 900;
  const maxHeight = 650;
  const aspectRatio = image.naturalWidth / image.naturalHeight;

  if (aspectRatio >= 1) {
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio)
    };
  }

  return {
    width: Math.round(maxHeight * aspectRatio),
    height: maxHeight
  };
}

function buildJigsawBoard() {
  const svg = document.getElementById('jigsaw-board-svg');

  svg.setAttribute('viewBox', `0 0 ${currentPuzzle.width} ${currentPuzzle.height}`);
  svg.innerHTML = '';

  const defs = createSvgElement('defs');

  currentPuzzle.pieces.forEach(piece => {
    const clipPath = createSvgElement('clipPath');
    clipPath.setAttribute('id', `jigsaw-board-clip-${piece.id}`);

    const path = createSvgElement('path');
    path.setAttribute('d', piece.d);

    clipPath.appendChild(path);
    defs.appendChild(clipPath);
  });

  svg.appendChild(defs);

  const background = createSvgElement('rect');
  background.setAttribute('x', '0');
  background.setAttribute('y', '0');
  background.setAttribute('width', currentPuzzle.width);
  background.setAttribute('height', currentPuzzle.height);
  background.setAttribute('class', 'jigsaw-board-background');
  svg.appendChild(background);

  const shadowImage = createSvgElement('image');
  shadowImage.setAttribute('id', 'jigsaw-shadow-image');
  shadowImage.setAttribute('href', currentImageSrc);
  shadowImage.setAttribute('x', '0');
  shadowImage.setAttribute('y', '0');
  shadowImage.setAttribute('width', currentPuzzle.width);
  shadowImage.setAttribute('height', currentPuzzle.height);
  shadowImage.setAttribute('preserveAspectRatio', 'none');
  shadowImage.setAttribute('class', 'jigsaw-shadow-image');
  svg.appendChild(shadowImage);

  const placedLayer = createSvgElement('g');
  placedLayer.setAttribute('id', 'jigsaw-placed-layer');
  svg.appendChild(placedLayer);

  const frame = createSvgElement('rect');
  frame.setAttribute('x', '0');
  frame.setAttribute('y', '0');
  frame.setAttribute('width', currentPuzzle.width);
  frame.setAttribute('height', currentPuzzle.height);
  frame.setAttribute('class', 'jigsaw-frame-line');
  svg.appendChild(frame);

  updateShadowVisibility();
}

function buildJigsawTray() {
  const tray = document.getElementById('jigsaw-piece-tray');
  tray.innerHTML = '';

  const piecesById = new Map(
    currentPuzzle.pieces.map(piece => [piece.id, piece])
  );

  const pieces = currentTrayOrder
    .map(pieceId => piecesById.get(pieceId))
    .filter(piece => {
      return piece &&
        !currentPlacedPieces.has(piece.id) &&
        (!currentCarryingPiece || currentCarryingPiece.id !== piece.id);
    });

  pieces.forEach(piece => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'jigsaw-piece-button';
    button.setAttribute('aria-label', `Puzzleteil ${piece.row + 1}-${piece.col + 1} aufnehmen`);

    button.innerHTML = createPieceSvgMarkup(piece, `tray-${piece.id}`, true);

    button.addEventListener('click', event => {
      event.stopPropagation();
      pickUpJigsawPiece(piece, event);
    });

    tray.appendChild(button);
  });
}

function pickUpJigsawPiece(piece, event) {
  if (currentCarryingPiece) {
    return;
  }

  currentCarryingPiece = piece;

  const box = getPieceViewBox(piece);
  const scale = getBoardDisplayScale();

  currentFloatingPieceElement = document.createElement('div');
  currentFloatingPieceElement.className = 'jigsaw-floating-piece';
  currentFloatingPieceElement.style.width = `${box.width * scale}px`;
  currentFloatingPieceElement.style.height = `${box.height * scale}px`;
  currentFloatingPieceElement.innerHTML = createPieceSvgMarkup(piece, `floating-${piece.id}-${Date.now()}`, false);

  document.body.appendChild(currentFloatingPieceElement);

  moveFloatingPiece(event);
  buildJigsawTray();

  updateJigsawStatus('Teil aufgenommen. Bewege die Maus und klicke erneut zum Ablegen.');
}

function moveFloatingPiece(event) {
  if (!currentFloatingPieceElement || !currentCarryingPiece) {
    return;
  }

  currentFloatingPieceElement.style.left = `${event.clientX}px`;
  currentFloatingPieceElement.style.top = `${event.clientY}px`;
}

function handleJigsawDrop(event) {
  if (!currentCarryingPiece || !currentPuzzle) {
    return;
  }

  const boardSvg = document.getElementById('jigsaw-board-svg');
  const boardRect = boardSvg.getBoundingClientRect();

  const isInsideBoard =
    event.clientX >= boardRect.left &&
    event.clientX <= boardRect.right &&
    event.clientY >= boardRect.top &&
    event.clientY <= boardRect.bottom;

  if (!isInsideBoard) {
    returnPieceToTray();
    return;
  }

  const scaleX = currentPuzzle.width / boardRect.width;
  const scaleY = currentPuzzle.height / boardRect.height;

  const dropX = (event.clientX - boardRect.left) * scaleX;
  const dropY = (event.clientY - boardRect.top) * scaleY;

  const target = getPieceTargetCenter(currentCarryingPiece);
  const distance = Math.hypot(dropX - target.x, dropY - target.y);

  const pieceWidth = currentPuzzle.width / currentPuzzle.cols;
  const pieceHeight = currentPuzzle.height / currentPuzzle.rows;
  const grace = Math.min(pieceWidth, pieceHeight) * JIGSAW_SNAP_GRACE;

  if (distance <= grace) {
    placePiece(currentCarryingPiece);
    return;
  }

  returnPieceToTray();
}

function placePiece(piece) {
  currentPlacedPieces.add(piece.id);

  const layer = document.getElementById('jigsaw-placed-layer');

  const group = createSvgElement('g');
  group.setAttribute('class', 'jigsaw-placed-piece');

  const image = createSvgElement('image');
  image.setAttribute('href', currentImageSrc);
  image.setAttribute('x', '0');
  image.setAttribute('y', '0');
  image.setAttribute('width', currentPuzzle.width);
  image.setAttribute('height', currentPuzzle.height);
  image.setAttribute('preserveAspectRatio', 'none');
  image.setAttribute('clip-path', `url(#jigsaw-board-clip-${piece.id})`);

  const outline = createSvgElement('path');
  outline.setAttribute('d', piece.d);
  outline.setAttribute('class', 'jigsaw-piece-outline');

  group.appendChild(image);
  group.appendChild(outline);
  layer.appendChild(group);

  stopCarryingPiece();
  buildJigsawTray();

  if (currentPlacedPieces.size === currentPuzzle.pieces.length) {
    updateJigsawStatus('Sehr gut! Das Puzzle ist fertig.');
    return;
  }

  updateJigsawStatus(`Gut gemacht! ${currentPlacedPieces.size} von ${currentPuzzle.pieces.length} Teilen liegen richtig.`);
}

function returnPieceToTray() {
  stopCarryingPiece();
  buildJigsawTray();
  updateJigsawStatus('Das Teil war noch nicht an der richtigen Stelle. Versuche es noch einmal.');
}

function stopCarryingPiece() {
  currentCarryingPiece = null;

  if (currentFloatingPieceElement) {
    currentFloatingPieceElement.remove();
    currentFloatingPieceElement = null;
  }
}

function getPieceTargetCenter(piece) {
  const pieceWidth = currentPuzzle.width / currentPuzzle.cols;
  const pieceHeight = currentPuzzle.height / currentPuzzle.rows;

  return {
    x: piece.col * pieceWidth + pieceWidth / 2,
    y: piece.row * pieceHeight + pieceHeight / 2
  };
}

function getPieceViewBox(piece) {
  const pieceWidth = currentPuzzle.width / currentPuzzle.cols;
  const pieceHeight = currentPuzzle.height / currentPuzzle.rows;
  const margin = Math.min(pieceWidth, pieceHeight) * 0.34;

  const x = piece.col * pieceWidth - margin;
  const y = piece.row * pieceHeight - margin;
  const width = pieceWidth + margin * 2;
  const height = pieceHeight + margin * 2;

  return { x, y, width, height };
}

function getBoardDisplayScale() {
  const boardSvg = document.getElementById('jigsaw-board-svg');
  const boardRect = boardSvg.getBoundingClientRect();

  if (!currentPuzzle || boardRect.width === 0) {
    return 1;
  }

  return boardRect.width / currentPuzzle.width;
}

function createPieceSvgMarkup(piece, idPrefix, isTrayPreview) {
  const box = getPieceViewBox(piece);
  const clipId = `${idPrefix}-clip`;

  return `
    <svg
      viewBox="${box.x} ${box.y} ${box.width} ${box.height}"
      class="${isTrayPreview ? 'jigsaw-piece-preview-svg' : 'jigsaw-floating-piece-svg'}"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="${clipId}">
          <path d="${piece.d}"></path>
        </clipPath>
      </defs>

      <image
        href="${currentImageSrc}"
        x="0"
        y="0"
        width="${currentPuzzle.width}"
        height="${currentPuzzle.height}"
        preserveAspectRatio="none"
        clip-path="url(#${clipId})"
      ></image>

      <path
        d="${piece.d}"
        class="jigsaw-piece-preview-outline"
      ></path>
    </svg>
  `;
}

function updateShadowVisibility() {
  const shadowImage = document.getElementById('jigsaw-shadow-image');
  const toggle = document.getElementById('jigsaw-shadow-toggle');

  if (!shadowImage || !toggle) {
    return;
  }

  shadowImage.style.display = toggle.checked ? 'block' : 'none';
}

function updateJigsawStatus(message) {
  const status = document.getElementById('jigsaw-status');

  if (status) {
    status.textContent = message;
  }
}

function createSvgElement(tagName) {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
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

// Generator for unique jigsaw-style SVG paths.
// Internal edges are shared, so pieces fit together.
const JigsawGenerator = (() => {
  function hashStringToNumber(text) {
    let hash = 1779033703 ^ text.length;

    for (let i = 0; i < text.length; i++) {
      hash = Math.imul(hash ^ text.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }

    return hash >>> 0;
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;

      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;

      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function randomBetween(random, min, max) {
    return min + random() * (max - min);
  }

  function randomSign(random) {
    return random() < 0.5 ? -1 : 1;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function fmt(value) {
    return Number(value.toFixed(2));
  }

  function lineTo(x, y) {
    return `L ${fmt(x)} ${fmt(y)} `;
  }

  function createEdge(random, baseDepth) {
    const width = randomBetween(random, 0.42, 0.62);
    const center = randomBetween(random, 0.43, 0.57);
    const neck = width * randomBetween(random, 0.28, 0.42);

    return {
      sign: randomSign(random),
      center,
      width,
      neck,
      depth: baseDepth * randomBetween(random, 0.75, 1.25),
      roundness: randomBetween(random, 0.85, 1.2)
    };
  }

  function edgeSegment(startX, startY, endX, endY, normalX, normalY, sign, edge, reverse = false) {
    const dx = endX - startX;
    const dy = endY - startY;

    const halfWidth = edge.width / 2;
    const halfNeck = edge.neck / 2;

    const a = clamp(edge.center - halfWidth, 0.15, 0.85);
    const b = clamp(edge.center - halfNeck, 0.15, 0.85);
    const c = clamp(edge.center + halfNeck, 0.15, 0.85);
    const d = clamp(edge.center + halfWidth, 0.15, 0.85);

    const depth = edge.depth * sign;
    const round = edge.roundness;

    function point(tCanonical, offset) {
      const t = reverse ? 1 - tCanonical : tCanonical;

      return {
        x: startX + dx * t + normalX * offset,
        y: startY + dy * t + normalY * offset
      };
    }

    function cCommand(c1, c2, p) {
      return `C ${fmt(c1.x)} ${fmt(c1.y)}, ${fmt(c2.x)} ${fmt(c2.y)}, ${fmt(p.x)} ${fmt(p.y)} `;
    }

    function lCommand(p) {
      return `L ${fmt(p.x)} ${fmt(p.y)} `;
    }

    if (!reverse) {
      const pA = point(a, 0);
      const pB = point(b, depth);
      const pC = point(c, depth);
      const pD = point(d, 0);
      const pEnd = point(1, 0);

      return [
        lCommand(pA),
        cCommand(point(a + (b - a) * 0.45, 0), point(b - (b - a) * 0.25, depth * round), pB),
        cCommand(point(b + (c - b) * 0.25, depth * 1.35 * round), point(c - (c - b) * 0.25, depth * 1.35 * round), pC),
        cCommand(point(c + (d - c) * 0.25, depth * round), point(d - (d - c) * 0.45, 0), pD),
        lCommand(pEnd)
      ].join('');
    }

    const pD = point(d, 0);
    const pC = point(c, depth);
    const pB = point(b, depth);
    const pA = point(a, 0);
    const pEnd = point(0, 0);

    return [
      lCommand(pD),
      cCommand(point(d - (d - c) * 0.45, 0), point(c + (d - c) * 0.25, depth * round), pC),
      cCommand(point(c - (c - b) * 0.25, depth * 1.35 * round), point(b + (c - b) * 0.25, depth * 1.35 * round), pB),
      cCommand(point(b - (b - a) * 0.25, depth * round), point(a + (b - a) * 0.45, 0), pA),
      lCommand(pEnd)
    ].join('');
  }

  function generate(options) {
    const cols = options.cols;
    const rows = options.rows;
    const width = options.width;
    const height = options.height;
    const seedText = String(options.seed || 'oma-puzzle');
    const jigginess = options.jigginess || 0.22;

    const seed = hashStringToNumber(seedText);
    const random = mulberry32(seed);

    const pieceWidth = width / cols;
    const pieceHeight = height / rows;
    const baseDepth = Math.min(pieceWidth, pieceHeight) * jigginess;

    const horizontalEdges = [];
    const verticalEdges = [];

    for (let row = 0; row < rows - 1; row++) {
      horizontalEdges[row] = [];

      for (let col = 0; col < cols; col++) {
        horizontalEdges[row][col] = createEdge(random, baseDepth);
      }
    }

    for (let row = 0; row < rows; row++) {
      verticalEdges[row] = [];

      for (let col = 0; col < cols - 1; col++) {
        verticalEdges[row][col] = createEdge(random, baseDepth);
      }
    }

    const pieces = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        pieces.push({
          row,
          col,
          id: `piece-${row}-${col}`,
          d: createPiecePath({
            row,
            col,
            rows,
            cols,
            pieceWidth,
            pieceHeight,
            horizontalEdges,
            verticalEdges
          })
        });
      }
    }

    return {
      rows,
      cols,
      width,
      height,
      pieces
    };
  }

  function createPiecePath(config) {
    const {
      row,
      col,
      rows,
      cols,
      pieceWidth,
      pieceHeight,
      horizontalEdges,
      verticalEdges
    } = config;

    const x0 = col * pieceWidth;
    const y0 = row * pieceHeight;
    const x1 = x0 + pieceWidth;
    const y1 = y0 + pieceHeight;

    let d = `M ${fmt(x0)} ${fmt(y0)} `;

    if (row === 0) {
      d += lineTo(x1, y0);
    } else {
      const edge = horizontalEdges[row - 1][col];
      d += edgeSegment(x0, y0, x1, y0, 0, -1, -edge.sign, edge, false);
    }

    if (col === cols - 1) {
      d += lineTo(x1, y1);
    } else {
      const edge = verticalEdges[row][col];
      d += edgeSegment(x1, y0, x1, y1, 1, 0, edge.sign, edge, false);
    }

    if (row === rows - 1) {
      d += lineTo(x0, y1);
    } else {
      const edge = horizontalEdges[row][col];
      d += edgeSegment(x1, y1, x0, y1, 0, 1, edge.sign, edge, true);
    }

    if (col === 0) {
      d += lineTo(x0, y0);
    } else {
      const edge = verticalEdges[row][col - 1];
      d += edgeSegment(x0, y1, x0, y0, -1, 0, -edge.sign, edge, true);
    }

    d += 'Z';

    return d;
  }

  return {
    generate
  };
})();