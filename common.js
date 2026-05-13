// common.js
// Shared code for all pages: color theme + easy cursor

const VALID_THEMES = [
  'standard',
  'dark',
  'bright',
  'highcontrast',
  'pastell',
  'ocean',
  'forest',
  'retro'
];

function getThemeLabel(theme) {
  return {
    standard: 'Standard Weiß',
    dark: 'Dunkel',
    bright: 'Hell',
    highcontrast: 'Hoher Kontrast',
    pastell: 'Pastell',
    ocean: 'Ozean',
    forest: 'Wald',
    retro: 'Retro'
  }[theme] || 'Standard Weiß';
}

function applyTheme(theme) {
  const selected = VALID_THEMES.includes(theme) ? theme : 'standard';

  document.body.dataset.theme = selected;
  localStorage.setItem('omasTheme', selected);

  const menu = document.getElementById('theme-menu');
  const toggle = document.getElementById('theme-toggle');

  if (menu) {
    menu.querySelectorAll('button').forEach(button => {
      button.classList.toggle(
        'active',
        button.textContent.trim() === getThemeLabel(selected)
      );
    });
  }

  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }
}

function setTheme(theme) {
  applyTheme(theme);

  const menu = document.getElementById('theme-menu');
  const toggle = document.getElementById('theme-toggle');

  if (menu) {
    menu.hidden = true;
    menu.classList.remove('open');
    menu.style.display = 'none';
  }

  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }
}

function toggleThemeMenu() {
  const menu = document.getElementById('theme-menu');
  const toggle = document.getElementById('theme-toggle');

  if (!menu || !toggle) {
    return;
  }

  const shouldOpen = menu.hidden;

  menu.hidden = !shouldOpen;
  menu.classList.toggle('open', shouldOpen);
  menu.style.display = shouldOpen ? 'flex' : 'none';

  toggle.setAttribute('aria-expanded', String(shouldOpen));
}

function loadTheme() {
  const savedTheme = localStorage.getItem('omasTheme') || 'standard';
  applyTheme(savedTheme);
}

function createEasyCursor() {
  if (document.getElementById('custom-cursor')) {
    return;
  }

  const customCursor = document.createElement('div');
  customCursor.id = 'custom-cursor';
  document.body.appendChild(customCursor);

  document.addEventListener('mousemove', (event) => {
    customCursor.style.left = event.clientX + 'px';
    customCursor.style.top = event.clientY + 'px';
  });
}

function closeThemeMenuWhenClickingOutside(event) {
  const menu = document.getElementById('theme-menu');
  const toggle = document.getElementById('theme-toggle');

  if (!menu || !toggle) {
    return;
  }

  if (!event.target.closest('.header-left')) {
    menu.hidden = true;
    menu.classList.remove('open');
    menu.style.display = 'none';
    toggle.setAttribute('aria-expanded', 'false');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  createEasyCursor();
  ensureOmasFloatingPlayer();
  updateOmasFloatingPlayer();
  startOmasBackgroundPlayer();
  setupOmasDynamicNavigation();
  window.addEventListener('pagehide', persistOmasPlayerBeforePageChange);
  window.addEventListener('beforeunload', persistOmasPlayerBeforePageChange);

  document.addEventListener('click', closeThemeMenuWhenClickingOutside);
});
const OMAS_PLAYER_STATE_KEY = 'omasActivePlayer';
const OMAS_PLAYER_MAX_AGE = 24 * 60 * 60 * 1000;
let omasBackgroundPlayer = null;
let omasBackgroundStateTimer = null;

function readOmasPlayerState() {
  try {
    const rawState = localStorage.getItem(OMAS_PLAYER_STATE_KEY);
    if (!rawState) return null;

    const state = JSON.parse(rawState);
    if (!state || state.stopped) return null;
    if (Date.now() - (state.updatedAt || 0) > OMAS_PLAYER_MAX_AGE) return null;
    if (!state.listId && !state.videoId) return null;

    return state;
  } catch (error) {
    return null;
  }
}

function writeOmasPlayerState(nextState) {
  const state = {
    ...nextState,
    updatedAt: Date.now(),
    stopped: false
  };
  localStorage.setItem(OMAS_PLAYER_STATE_KEY, JSON.stringify(state));
  updateOmasFloatingPlayer();
}

function clearOmasPlayerState() {
  localStorage.removeItem(OMAS_PLAYER_STATE_KEY);
  updateOmasFloatingPlayer();
}

function isVideosPage() {
  return Boolean(document.getElementById('player-section') && document.getElementById('video-iframe'));
}

function isFullPlayerVisible() {
  const playerSection = document.getElementById('player-section');
  return Boolean(playerSection && playerSection.style.display !== 'none' && getComputedStyle(playerSection).display !== 'none');
}

function ensureOmasFloatingPlayer() {
  let controls = document.getElementById('omas-floating-player');
  if (controls) return controls;

  controls = document.createElement('div');
  controls.id = 'omas-floating-player';
  controls.className = 'omas-floating-player';
  controls.hidden = true;
  controls.innerHTML = `
    <div class="omas-floating-title" id="omas-floating-title">Musik laeuft</div>
    <div class="omas-floating-controls">
      <button type="button" id="omas-floating-back">Zu Videos</button>
      <button type="button" id="omas-floating-pause">Pause</button>
      <button type="button" id="omas-floating-stop">Stop</button>
    </div>
    <label class="omas-floating-volume">
      <span>Lautstaerke</span>
      <input type="range" id="omas-floating-volume" min="0" max="100" value="5" step="1">
    </label>
  `;
  document.body.appendChild(controls);

  document.getElementById('omas-floating-back').addEventListener('click', async () => {
    if (typeof window.showOmasFullPlayer === 'function') {
      window.showOmasFullPlayer();
      return;
    }

    if (shouldUseOmasDynamicNavigation('index.html')) {
      const didNavigate = await navigateOmasPageWithoutReload('index.html');
      if (didNavigate && typeof window.showOmasFullPlayer === 'function') {
        window.showOmasFullPlayer();
        return;
      }
    }

    window.location.href = 'index.html?player=restore';
  });

  document.getElementById('omas-floating-pause').addEventListener('click', () => {
    toggleOmasBackgroundPause();
  });

  document.getElementById('omas-floating-stop').addEventListener('click', () => {
    stopOmasBackgroundPlayer();
  });

  document.getElementById('omas-floating-volume').addEventListener('input', (event) => {
    const volume = parseInt(event.target.value, 10);
    if (window.omasVisiblePlayerCommand && window.omasVisiblePlayerCommand('volume', volume)) {
      return;
    }

    if (omasBackgroundPlayer && typeof omasBackgroundPlayer.setVolume === 'function') {
      omasBackgroundPlayer.setVolume(volume);
    }

    const state = readOmasPlayerState();
    if (state) {
      writeOmasPlayerState({ ...state, volume });
    }
  });

  return controls;
}

function updateOmasFloatingPlayer() {
  const controls = ensureOmasFloatingPlayer();
  const state = readOmasPlayerState();
  controls.hidden = !state || isFullPlayerVisible();

  if (!state) return;

  const title = document.getElementById('omas-floating-title');
  const pauseButton = document.getElementById('omas-floating-pause');
  const volumeSlider = document.getElementById('omas-floating-volume');

  if (title) {
    title.textContent = state.title || state.playlistTitle || 'Musik laeuft';
  }

  if (pauseButton) {
    pauseButton.textContent = state.playing === false ? 'Weiter' : 'Pause';
  }

  if (volumeSlider && Number.isFinite(state.volume)) {
    volumeSlider.value = String(state.volume);
  }
}

function loadYouTubeApiForBackground(callback) {
  if (window.YT && window.YT.Player) {
    callback();
    return;
  }

  const previousReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (typeof previousReady === 'function') {
      previousReady();
    }
    callback();
  };

  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  }
}

function ensureBackgroundPlayerSlot() {
  let slot = document.getElementById('omas-background-youtube-player');
  if (slot) return slot;

  slot = document.createElement('div');
  slot.id = 'omas-background-youtube-player';
  slot.className = 'omas-background-youtube-player';
  document.body.appendChild(slot);
  return slot;
}

function startOmasBackgroundPlayer() {
  const state = readOmasPlayerState();
  if (!state || isVideosPage()) {
    updateOmasFloatingPlayer();
    return;
  }

  ensureOmasFloatingPlayer();
  loadYouTubeApiForBackground(() => {
    const slot = ensureBackgroundPlayerSlot();
    omasBackgroundPlayer = new YT.Player(slot.id, {
      height: '1',
      width: '1',
      events: {
        onReady: () => restoreOmasBackgroundState(state),
        onStateChange: syncOmasBackgroundState
      }
    });
  });
}

function restoreOmasBackgroundState(state) {
  if (!omasBackgroundPlayer) return;

  const volume = Number.isFinite(state.volume) ? state.volume : 5;
  omasBackgroundPlayer.setVolume(volume);

  if (state.listId && !state.isLoop) {
    omasBackgroundPlayer.loadPlaylist({
      list: state.listId,
      listType: 'playlist',
      index: state.playlistIndex || 0,
      startSeconds: Math.max(0, Math.floor(state.currentTime || 0))
    });
  } else if (state.videoId) {
    omasBackgroundPlayer.loadVideoById({
      videoId: state.videoId,
      startSeconds: Math.max(0, Math.floor(state.currentTime || 0))
    });
  }

  if (state.playing === false) {
    setTimeout(() => omasBackgroundPlayer.pauseVideo(), 300);
  } else {
    setTimeout(() => {
      if (omasBackgroundPlayer && typeof omasBackgroundPlayer.playVideo === 'function') {
        omasBackgroundPlayer.playVideo();
        saveOmasBackgroundSnapshot({ playing: true });
      }
    }, 500);
  }

  clearInterval(omasBackgroundStateTimer);
  omasBackgroundStateTimer = setInterval(saveOmasBackgroundSnapshot, 3000);
  updateOmasFloatingPlayer();
}

function getOmasBackgroundSnapshot(extra = {}) {
  const state = readOmasPlayerState();
  if (!state || !omasBackgroundPlayer || typeof omasBackgroundPlayer.getCurrentTime !== 'function') {
    return state;
  }

  const videoData = typeof omasBackgroundPlayer.getVideoData === 'function'
    ? omasBackgroundPlayer.getVideoData()
    : {};

  return {
    ...state,
    ...extra,
    videoId: videoData.video_id || state.videoId,
    title: videoData.title || state.title,
    currentTime: omasBackgroundPlayer.getCurrentTime() || 0,
    volume: omasBackgroundPlayer.getVolume ? omasBackgroundPlayer.getVolume() : state.volume,
    playlistIndex: omasBackgroundPlayer.getPlaylistIndex ? omasBackgroundPlayer.getPlaylistIndex() : state.playlistIndex
  };
}

function saveOmasBackgroundSnapshot(extra = {}) {
  const snapshot = getOmasBackgroundSnapshot(extra);
  if (snapshot) {
    writeOmasPlayerState(snapshot);
  }
}

function persistOmasPlayerBeforePageChange() {
  const state = readOmasPlayerState();
  if (state) {
    writeOmasPlayerState({ ...state, playing: state.playing !== false });
  }
}

function syncOmasBackgroundState(event) {
  if (!window.YT || !YT.PlayerState) return;

  if (event.data === YT.PlayerState.PLAYING) {
    saveOmasBackgroundSnapshot({ playing: true });
  } else if (event.data === YT.PlayerState.PAUSED) {
    if (document.visibilityState === 'hidden') {
      persistOmasPlayerBeforePageChange();
      return;
    }
    saveOmasBackgroundSnapshot({ playing: false });
  } else if (event.data === YT.PlayerState.ENDED) {
    saveOmasBackgroundSnapshot({ playing: false });
  }
}

function toggleOmasBackgroundPause() {
  if (window.omasVisiblePlayerCommand && window.omasVisiblePlayerCommand('pause')) {
    return;
  }

  const state = readOmasPlayerState();
  if (!state) return;

  if (omasBackgroundPlayer && typeof omasBackgroundPlayer.pauseVideo === 'function') {
    if (state.playing === false) {
      omasBackgroundPlayer.playVideo();
      saveOmasBackgroundSnapshot({ playing: true });
    } else {
      omasBackgroundPlayer.pauseVideo();
      saveOmasBackgroundSnapshot({ playing: false });
    }
  } else {
    writeOmasPlayerState({ ...state, playing: state.playing === false });
  }
}

function stopOmasBackgroundPlayer() {
  if (window.omasVisiblePlayerCommand && window.omasVisiblePlayerCommand('stop')) {
    return;
  }

  if (omasBackgroundPlayer && typeof omasBackgroundPlayer.stopVideo === 'function') {
    omasBackgroundPlayer.stopVideo();
  }
  clearInterval(omasBackgroundStateTimer);
  clearOmasPlayerState();
}

window.readOmasPlayerState = readOmasPlayerState;
window.writeOmasPlayerState = writeOmasPlayerState;
window.clearOmasPlayerState = clearOmasPlayerState;
window.updateOmasFloatingPlayer = updateOmasFloatingPlayer;

const OMAS_DYNAMIC_PAGE_SCRIPTS = {
  'index.html': ['videos.js', 'script.js'],
  'games.html': [],
  'memory.html': ['memory.js'],
  'jigsaw.html': ['jigsaw.js'],
  'time-weather.html': ['time-weather.js']
};

const OMAS_DYNAMIC_PAGE_INITIALIZERS = {
  'index.html': 'initOmasVideosPage',
  'memory.html': 'initMemoryPage',
  'jigsaw.html': 'initJigsawPage',
  'time-weather.html': 'initTimeWeatherPage'
};

function getOmasPageName(url) {
  const parsedUrl = new URL(url, window.location.href);
  const pageName = parsedUrl.pathname.split('/').pop() || 'index.html';
  return pageName.endsWith('.html') ? pageName : null;
}

function getOmasNavigationTarget(event) {
  const link = event.target.closest('a[href]');
  if (link) {
    return link.getAttribute('href');
  }

  const button = event.target.closest('button[onclick]');
  if (!button) return null;

  const onclick = button.getAttribute('onclick') || '';
  const match = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function shouldUseOmasDynamicNavigation(target) {
  if (!target || target.startsWith('#')) return false;
  const state = readOmasPlayerState();
  if (!state || state.playing === false) return false;

  const targetUrl = new URL(target, window.location.href);
  if (targetUrl.origin !== window.location.origin) return false;

  const pageName = getOmasPageName(targetUrl.href);
  return Boolean(pageName && Object.prototype.hasOwnProperty.call(OMAS_DYNAMIC_PAGE_SCRIPTS, pageName));
}

async function loadOmasDynamicScript(src) {
  if (document.querySelector(`script[data-omas-dynamic-script="${src}"]`) || document.querySelector(`script[src="${src}"]`)) {
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.dataset.omasDynamicScript = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function initializeOmasDynamicPage(pageName) {
  const scripts = OMAS_DYNAMIC_PAGE_SCRIPTS[pageName] || [];
  for (const scriptSrc of scripts) {
    await loadOmasDynamicScript(scriptSrc);
  }

  const initializerName = OMAS_DYNAMIC_PAGE_INITIALIZERS[pageName];
  if (initializerName && typeof window[initializerName] === 'function') {
    window[initializerName]();
  }

  loadTheme();
  ensureOmasFloatingPlayer();
  updateOmasFloatingPlayer();
  window.scrollTo({ top: 0, left: 0 });
}

async function navigateOmasPageWithoutReload(target, pushState = true) {
  const targetUrl = new URL(target, window.location.href);
  const pageName = getOmasPageName(targetUrl.href);
  if (!pageName) return false;

  const response = await fetch(targetUrl.href, { cache: 'no-store' });
  if (!response.ok) return false;

  const html = await response.text();
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
  const newHeader = parsedDocument.querySelector('header');
  const newMain = parsedDocument.querySelector('main');
  const currentHeader = document.querySelector('header');
  const currentMain = document.querySelector('main');

  if (!newHeader || !newMain || !currentHeader || !currentMain) {
    return false;
  }

  if (typeof window.cleanupOmasDynamicPage === 'function') {
    window.cleanupOmasDynamicPage();
    window.cleanupOmasDynamicPage = null;
  }

  currentHeader.replaceWith(newHeader);
  currentMain.replaceWith(newMain);
  document.title = parsedDocument.title || document.title;

  if (pushState) {
    history.pushState({ omasDynamicPage: true }, '', targetUrl.href);
  }

  await initializeOmasDynamicPage(pageName);
  return true;
}

function setupOmasDynamicNavigation() {
  document.addEventListener('click', async (event) => {
    const target = getOmasNavigationTarget(event);
    if (!shouldUseOmasDynamicNavigation(target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try {
      const didNavigate = await navigateOmasPageWithoutReload(target);
      if (!didNavigate) {
        window.location.href = target;
      }
    } catch (error) {
      window.location.href = target;
    }
  }, true);

  window.addEventListener('popstate', async () => {
    const pageName = getOmasPageName(window.location.href);
    if (!pageName || !Object.prototype.hasOwnProperty.call(OMAS_DYNAMIC_PAGE_SCRIPTS, pageName)) return;
    await navigateOmasPageWithoutReload(window.location.href, false);
  });
}