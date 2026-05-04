// script.js

let currentSection = 'playlists'; // default to playlists
let player;
let currentListId = null;
let currentPlaylistTitle = '';
let currentVideoId = null;
let videoTitleCache = {};
let playlistTitleCache = {};
let playlistMenuRequestId = 0;

// Load favorites from localStorage
function loadFavorites() {
  const favs = localStorage.getItem('omasVideosFavorites');
  return favs ? JSON.parse(favs) : [];
}

// Save favorites to localStorage
function saveFavorites(favs) {
  localStorage.setItem('omasVideosFavorites', JSON.stringify(favs));
}

// Toggle favorite for current video
function toggleFavoriteCurrent() {
  if (!currentVideoId) return;
  let favs = loadFavorites();
  const existing = favs.find(f => f.id === currentVideoId);
  if (existing) {
    favs = favs.filter(f => f.id !== currentVideoId);
  } else {
    const data = player.getVideoData();
    favs.push({
      id: data.video_id,
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`
    });
  }
  saveFavorites(favs);
  updateFavoriteButton();
  if (currentSection === 'favorites') {
    renderFavorites();
  }
}

// Check if current video is favorite
function isCurrentFavorite() {
  const favs = loadFavorites();
  return favs.some(f => f.id === currentVideoId);
}

// Update favorite button
function updateFavoriteButton() {
  const btn = document.getElementById('fav-btn');
  if (btn) {
    const isFav = isCurrentFavorite();
    btn.textContent = isFav ? 'Aus Favoriten entfernen' : 'Als Favorit speichern';
    btn.classList.toggle('favorited', isFav);
  }
}

// Render favorites
function renderFavorites() {
  const container = document.getElementById('favorites-list');
  container.innerHTML = '';

  const favs = loadFavorites();
  if (favs.length === 0) {
    container.innerHTML = '<p>Sie haben noch keine Favoriten gespeichert.</p>';
    return;
  }

  favs.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.addEventListener('click', () => playVideo(video.id));

    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title} Thumbnail" style="cursor: pointer;">
      <h3>${video.title}</h3>
      <button class="play-btn" onclick="event.stopPropagation(); playVideo('${video.id}')" aria-label="Video abspielen">Abspielen</button>
      <button class="fav-btn favorited" onclick="event.stopPropagation(); toggleFavorite('${video.id}')" aria-label="Aus Favoriten entfernen">Aus Favoriten entfernen</button>
    `;

    container.appendChild(card);
  });
}

// Render playlists
async function renderPlaylists() {
  const container = document.getElementById('playlists-list');
  container.innerHTML = '';

  for (const playlist of playlists) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const { title, thumbnail } = await fetchPlaylistTitle(playlist.listId);

    const imgHtml = thumbnail ? `<img src="${thumbnail}" alt="${title} Thumbnail" onclick="(async () => await playPlaylist('${playlist.listId}'))()" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">` : '';

    card.addEventListener('click', async () => await playPlaylist(playlist.listId));
    card.innerHTML = `
      ${imgHtml}
      <h3>${title}</h3>
      <button class="play-btn" onclick="event.stopPropagation(); (async () => await playPlaylist('${playlist.listId}'))()" aria-label="Playlist abspielen">Abspielen</button>
    `;

    container.appendChild(card);
  }
}

async function fetchVideoTitle(videoId) {
  if (videoTitleCache[videoId]) {
    return videoTitleCache[videoId];
  }

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`);
    if (!response.ok) {
      throw new Error('Titel konnte nicht geladen werden');
    }
    const data = await response.json();
    videoTitleCache[videoId] = data.title;
    return data.title;
  } catch (error) {
    return `Video ${videoId}`;
  }
}

async function fetchPlaylistTitle(listId) {
  if (playlistTitleCache[listId]) {
    return playlistTitleCache[listId];
  }

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${encodeURIComponent(listId)}&format=json`);
    if (!response.ok) {
      throw new Error('Playlist-Titel konnte nicht geladen werden');
    }
    const data = await response.json();
    const result = { title: data.title, thumbnail: data.thumbnail_url };
    playlistTitleCache[listId] = result;
    return result;
  } catch (error) {
    return { title: `Playlist ${listId}`, thumbnail: null };
  }
}

function playPlaylistVideoAt(index) {
  if (!player || currentListId === null) {
    return;
  }

  const playlistIds = player.getPlaylist();
  if (!playlistIds || playlistIds.length <= index) {
    return;
  }

  currentVideoId = playlistIds[index];
  isLoop = false;
  player.playVideoAt(index);
  updateToggleButtons();
  updateFavoriteButton();
}

async function updatePlaylistMenu() {
  const sidebar = document.getElementById('playlist-sidebar');
  if (!sidebar) {
    return;
  }

  if (!currentListId || !player || typeof player.getPlaylist !== 'function') {
    sidebar.innerHTML = '<h3>Playlist-Videos</h3><p>Hier werden die anderen Videos der aktuellen Playlist angezeigt.</p>';
    return;
  }

  const playlistIds = player.getPlaylist();
  const currentIndex = player.getPlaylistIndex();
  const playlistLabel = currentPlaylistTitle || 'Playlist-Videos';

  if (!playlistIds || playlistIds.length === 0) {
    sidebar.innerHTML = `<h3>${playlistLabel}</h3><p>Die Playlist wird geladen oder enthält keine Videos.</p>`;
    return;
  }

  const listHtmlParts = [`<h3>${playlistLabel}</h3>`, '<div class="playlist-items">'];
  playlistIds.forEach((videoId, index) => {
    const title = videoTitleCache[videoId] || `Video ${index + 1}`;
    const activeClass = index === currentIndex ? ' active' : '';
    listHtmlParts.push(`
      <button class="playlist-item${activeClass}" onclick="playPlaylistVideoAt(${index})" data-video-id="${videoId}">
        ${title}
      </button>
    `);
  });
  listHtmlParts.push('</div>');
  sidebar.innerHTML = listHtmlParts.join('');

  for (const videoId of playlistIds) {
    if (!videoTitleCache[videoId]) {
      const title = await fetchVideoTitle(videoId);
      const button = sidebar.querySelector(`button[data-video-id="${videoId}"]`);
      if (button) {
        button.textContent = title;
      }
    }
  }
}

async function refreshPlaylistMenuWhenReady(expectedListId, previousPlaylistIds = []) {
  const requestId = ++playlistMenuRequestId;
  const sidebar = document.getElementById('playlist-sidebar');

  if (sidebar) {
    sidebar.innerHTML = `
      <h3>${currentPlaylistTitle || 'Playlist-Videos'}</h3>
      <p>Playlist wird geladen...</p>
    `;
  }

  const previousSignature = Array.isArray(previousPlaylistIds)
    ? previousPlaylistIds.join('|')
    : '';

  // YouTube often needs a moment before getPlaylist() contains the NEW playlist.
  for (let attempt = 0; attempt < 20; attempt++) {
    if (requestId !== playlistMenuRequestId) {
      return;
    }

    if (currentListId !== expectedListId) {
      return;
    }

    if (player && typeof player.getPlaylist === 'function') {
      const playlistIds = player.getPlaylist();
      const currentSignature = Array.isArray(playlistIds)
        ? playlistIds.join('|')
        : '';

      const hasPlaylist = playlistIds && playlistIds.length > 0;
      const playlistChanged = currentSignature && currentSignature !== previousSignature;
      const firstPlaylistLoad = !previousSignature && hasPlaylist;

      if (firstPlaylistLoad || playlistChanged) {
        await updatePlaylistMenu();
        return;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Last fallback after waiting.
  if (requestId === playlistMenuRequestId && currentListId === expectedListId) {
    await updatePlaylistMenu();
  }
}

async function setCurrentPlaylistTitleById(listId) {
  const { title } = await fetchPlaylistTitle(listId);
  currentPlaylistTitle = title;
}

// Play playlist
async function playPlaylist(listId) {
  const previousPlaylistIds =
    player && typeof player.getPlaylist === 'function'
      ? player.getPlaylist() || []
      : [];

  currentListId = listId;
  await setCurrentPlaylistTitleById(listId);
  isLoop = false;
  currentVideoId = null;

  const playerSection = document.getElementById('player-section');
  playerSection.style.display = 'flex';

  const sidebar = document.getElementById('playlist-sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <h3>${currentPlaylistTitle || 'Playlist-Videos'}</h3>
      <p>Playlist wird geladen...</p>
    `;
  }

  if (player) {
    player.loadPlaylist({
      list: listId,
      listType: 'playlist',
      index: 0,
      startSeconds: 0,
      autoplay: 1
    });

    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
      player.setVolume(parseInt(volumeSlider.value));
    }

    await refreshPlaylistMenuWhenReady(listId, previousPlaylistIds);
  } else {
    player = new YT.Player('video-iframe', {
      height: '400',
      width: '100%',
      playerVars: {
        list: listId,
        listType: 'playlist',
        autoplay: 1
      },
      events: {
        onStateChange: onPlayerStateChange,
        onReady: onPlayerReady
      }
    });
  }

  updateToggleButtons();
}

// Play video
function playVideo(videoId) {
  const favs = loadFavorites();
  const video = favs.find(v => v.id === videoId);
  if (!video) return;

  currentListId = null;
  isLoop = true;
  currentVideoId = videoId;

  const playerSection = document.getElementById('player-section');
  playerSection.style.display = 'flex';

  if (player) {
    player.loadVideoById(videoId);
    player.setVolume(parseInt(document.getElementById('volume-slider').value));
    updatePlaylistMenu();
  } else {
    player = new YT.Player('video-iframe', {
      height: '400',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: videoId
      },
      events: {
        onStateChange: onPlayerStateChange,
        onReady: onPlayerReady
      }
    });
  }
  updateToggleButtons();
}

// Player ready
function onPlayerReady(event) {
  player.setVolume(5);

  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(parseInt(e.target.value));
      }
    });
  }

  if (currentListId) {
    refreshPlaylistMenuWhenReady(currentListId);
  }
}

// Player state change
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    if (isLoop && currentVideoId) {
      player.playVideo();
    }
  }

  if (event.data == YT.PlayerState.PLAYING) {
    currentVideoId = player.getVideoData().video_id;
    updateFavoriteButton();

    if (currentListId) {
      updatePlaylistMenu();
    }
  }
}

// Toggle to single video loop
function toggleSingleVideo() {
  isLoop = true;
  if (currentVideoId) {
    player.loadVideoById({
      videoId: currentVideoId,
      startSeconds: 0,
      suggestedQuality: 'large'
    });
    player.setLoop(true);
  }
  updateToggleButtons();
}

// Toggle to playlist
async function togglePlaylist() {
  isLoop = false;

  if (currentListId && player) {
    const previousPlaylistIds =
      typeof player.getPlaylist === 'function'
        ? player.getPlaylist() || []
        : [];

    player.loadPlaylist({
      list: currentListId,
      listType: 'playlist',
      index: 0,
      startSeconds: 0,
      autoplay: 1
    });

    await refreshPlaylistMenuWhenReady(currentListId, previousPlaylistIds);
  }

  updateToggleButtons();
}

// Update toggle buttons
function updateToggleButtons() {
  const singleBtn = document.getElementById('single-btn');
  const playlistBtn = document.getElementById('playlist-btn');
  if (singleBtn && playlistBtn) {
    singleBtn.classList.toggle('active', isLoop);
    playlistBtn.classList.toggle('active', !isLoop);
  }
}

// Close player
function closePlayer() {
  playlistMenuRequestId++;

  const playerSection = document.getElementById('player-section');

  if (player) {
    player.stopVideo();
  }

  playerSection.style.display = 'none';
}

// Switch section
function switchSection(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(`${section}-section`).style.display = 'block';

  // Update nav buttons
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`nav button[onclick="switchSection('${section}')"]`).classList.add('active');

  if (section === 'favorites') {
    renderFavorites();
  } else if (section === 'playlists') {
    (async () => await renderPlaylists())();
  }
}

function applyTheme(theme) {
  const validThemes = ['standard', 'dark', 'bright', 'highcontrast', 'pastell', 'ocean', 'forest', 'retro'];
  const selected = validThemes.includes(theme) ? theme : 'standard';
  document.body.dataset.theme = selected;
  localStorage.setItem('omasTheme', selected);

  const menu = document.getElementById('theme-menu');
  const toggle = document.getElementById('theme-toggle');
  if (menu) {
    menu.hidden = true;
  }
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (menu) {
    menu.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', button.textContent.trim() === getThemeLabel(selected));
    });
  }
}

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
  if (!menu || !toggle) return;
  const isOpen = menu.hidden;
  menu.hidden = !isOpen;
  if (menu.hidden) {
    menu.classList.remove('open');
    menu.style.display = 'none';
  } else {
    menu.classList.add('open');
    menu.style.display = 'flex';
  }
  toggle.setAttribute('aria-expanded', String(!menu.hidden));
}

function loadTheme() {
  const saved = localStorage.getItem('omasTheme');
  applyTheme(saved || 'standard');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  // Create custom cursor for better visibility
  const customCursor = document.createElement('div');
  customCursor.id = 'custom-cursor';
  document.body.appendChild(customCursor);

  // Move custom cursor with mouse
  document.addEventListener('mousemove', (e) => {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('click', (event) => {
    const menu = document.getElementById('theme-menu');
    const toggle = document.getElementById('theme-toggle');
    if (menu && toggle && !event.target.closest('.header-left')) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  switchSection('playlists');
});

// YouTube API ready
function onYouTubeIframeAPIReady() {
  // Player will be created when needed
}