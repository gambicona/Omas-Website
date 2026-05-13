// script.js

let currentSection = 'playlists'; // default to playlists
let player;
let currentListId = null;
let currentPlaylistTitle = '';
let currentVideoId = null;
let videoTitleCache = {};
let playlistTitleCache = {};
let isLoop = false;
let pendingPlayerRestore = false;
let playerStateTimer = null;
const singleLoopMessage = 'Sie haben Einzelwiedergabe ausgewählt. Klicken Sie einmal auf Playlist im Menu unter dem Video.';
function getCurrentPlaybackState(extra = {}) {
  if (!player || typeof player.getVideoData !== 'function') {
    return null;
  }

  const data = player.getVideoData() || {};
  const savedState = typeof window.readOmasPlayerState === 'function' ? window.readOmasPlayerState() : null;
  const playerState = player.getPlayerState ? player.getPlayerState() : null;
  let isCurrentlyPlaying = savedState ? savedState.playing !== false : true;

  if (window.YT && YT.PlayerState) {
    if (playerState === YT.PlayerState.PLAYING || playerState === YT.PlayerState.BUFFERING) {
      isCurrentlyPlaying = true;
    } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) {
      isCurrentlyPlaying = false;
    }
  }
  return {
    mode: currentListId && !isLoop ? 'playlist' : 'video',
    listId: currentListId,
    playlistTitle: currentPlaylistTitle,
    videoId: data.video_id || currentVideoId,
    title: data.title || currentPlaylistTitle || 'Musik laeuft',
    currentTime: player.getCurrentTime ? player.getCurrentTime() : 0,
    volume: player.getVolume ? player.getVolume() : parseInt(document.getElementById('volume-slider')?.value || '5', 10),
    playlistIndex: player.getPlaylistIndex ? player.getPlaylistIndex() : 0,
    isLoop,
    playing: isCurrentlyPlaying,
    ...extra
  };
}

function persistCurrentPlayback(extra = {}) {
  const state = getCurrentPlaybackState(extra);
  if (state && state.videoId && typeof window.writeOmasPlayerState === 'function') {
    window.writeOmasPlayerState(state);
  }
}

function persistPlaybackBeforePageChange() {
  const savedState = typeof window.readOmasPlayerState === 'function' ? window.readOmasPlayerState() : null;
  persistCurrentPlayback({
    playing: savedState ? savedState.playing !== false : true
  });
}

function shouldRestoreSavedPlayer() {
  return Boolean(typeof window.readOmasPlayerState === 'function' && window.readOmasPlayerState());
}

function restoreVisiblePlayerFromSavedState() {
  const state = typeof window.readOmasPlayerState === 'function' ? window.readOmasPlayerState() : null;
  if (!state || player) return;
  if (!window.YT || !window.YT.Player) {
    pendingPlayerRestore = true;
    return;
  }

  currentListId = state.listId || null;
  currentPlaylistTitle = state.playlistTitle || '';
  currentVideoId = state.videoId || null;
  isLoop = Boolean(state.isLoop || !state.listId);

  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider && Number.isFinite(state.volume)) {
    volumeSlider.value = String(state.volume);
  }

  const playerSection = document.getElementById('player-section');
  if (playerSection) {
    playerSection.style.display = 'flex';
  }

  const playerConfig = {
    height: '400',
    width: '100%',
    events: {
      onStateChange: onPlayerStateChange,
      onReady: (event) => {
        onPlayerReady(event);
        const volume = Number.isFinite(state.volume) ? state.volume : 5;
        player.setVolume(volume);

        if (state.listId && !isLoop) {
          player.loadPlaylist({
            list: state.listId,
            listType: 'playlist',
            index: state.playlistIndex || 0,
            startSeconds: Math.max(0, Math.floor(state.currentTime || 0))
          });
        } else if (state.videoId) {
          player.loadVideoById({
            videoId: state.videoId,
            startSeconds: Math.max(0, Math.floor(state.currentTime || 0))
          });
        }

        if (state.playing === false) {
          setTimeout(() => player.pauseVideo(), 300);
        } else {
          setTimeout(() => {
            if (player && typeof player.playVideo === 'function') {
              player.playVideo();
              persistCurrentPlayback({ playing: true });
            }
          }, 500);
        }
      }
    }
  };

  player = new YT.Player('video-iframe', playerConfig);
  updateToggleButtons();
  updatePlaylistMenu();
}

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

  const playlistLabel = currentPlaylistTitle || 'Playlist-Videos';

  if (!currentListId || !player || typeof player.getPlaylist !== 'function') {
    const message = isLoop ? singleLoopMessage : 'Hier werden die anderen Videos der aktuellen Playlist angezeigt.';
    renderSidebarMessage(playlistLabel, message);
    return;
  }

  const playlistIds = player.getPlaylist();
  const currentIndex = player.getPlaylistIndex();

  if (!playlistIds || playlistIds.length === 0) {
    renderSidebarMessage(playlistLabel, singleLoopMessage);
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

function renderSidebarMessage(label, message) {
  const sidebar = document.getElementById('playlist-sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  const heading = document.createElement('h3');
  heading.textContent = label;
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  sidebar.append(heading, paragraph);
}

async function setCurrentPlaylistTitleById(listId) {
  const { title } = await fetchPlaylistTitle(listId);
  currentPlaylistTitle = title;
}

// Play playlist
async function playPlaylist(listId) {
  currentListId = listId;
  await setCurrentPlaylistTitleById(listId);
  isLoop = false;
  currentVideoId = null;

  const playerSection = document.getElementById('player-section');
  playerSection.style.display = 'flex';

  if (player) {
    player.loadPlaylist({list: listId, listType: 'playlist', autoplay: 1});
    player.setVolume(parseInt(document.getElementById('volume-slider').value));
    persistCurrentPlayback({ playing: true });
    updatePlaylistMenu();
    const playlistBtn = document.getElementById('playlist-btn');
    if (playlistBtn) {
      playlistBtn.click();
    }
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
    persistCurrentPlayback({ playing: true });
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
  // Player is ready
  const savedState = typeof window.readOmasPlayerState === 'function' ? window.readOmasPlayerState() : null;
  const savedVolume = savedState && Number.isFinite(savedState.volume) ? savedState.volume : 5;
  player.setVolume(savedVolume); // Set initial volume to 5%

  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(parseInt(e.target.value));
        persistCurrentPlayback();
      }
    });
  }

  if (currentListId && !isLoop) {
    const playlistBtn = document.getElementById('playlist-btn');
    if (playlistBtn) {
      playlistBtn.click();
    }
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
    updatePlaylistMenu();
    persistCurrentPlayback({ playing: true });
  }
  if (event.data == YT.PlayerState.PAUSED) {
    if (document.visibilityState === 'hidden') {
      persistPlaybackBeforePageChange();
      return;
    }
    persistCurrentPlayback({ playing: false });
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
    persistCurrentPlayback({ playing: true });
  }
  updateToggleButtons();
}

// Toggle to playlist
function togglePlaylist() {
  isLoop = false;
  if (currentListId && player) {
    player.loadPlaylist({list: currentListId, listType: 'playlist'});
    updatePlaylistMenu();
    persistCurrentPlayback({ playing: true });
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
  const playerSection = document.getElementById('player-section');
  persistCurrentPlayback();
  if (playerSection) {
    playerSection.style.display = 'none';
  }
  if (typeof window.updateOmasFloatingPlayer === 'function') {
    window.updateOmasFloatingPlayer();
  }
}

function stopPlaybackFromMiniPlayer() {
  if (player && typeof player.stopVideo === 'function') {
    player.stopVideo();
  }
  if (typeof window.clearOmasPlayerState === 'function') {
    window.clearOmasPlayerState();
  }
  if (typeof window.updateOmasFloatingPlayer === 'function') {
    window.updateOmasFloatingPlayer();
  }
}

function setupPlayerOverlayClose() {
  const playerSection = document.getElementById('player-section');
  if (!playerSection) return;

  playerSection.addEventListener('click', (event) => {
    if (event.target === playerSection) {
      closePlayer();
    }
  });
}

window.showOmasFullPlayer = function () {
  const playerSection = document.getElementById('player-section');
  if (playerSection) {
    playerSection.style.display = 'flex';
  }
  if (typeof window.updateOmasFloatingPlayer === 'function') {
    window.updateOmasFloatingPlayer();
  }
};

window.omasVisiblePlayerCommand = function (command, value) {
  const playerSection = document.getElementById('player-section');
  const hasVisiblePagePlayer = Boolean(player && playerSection);
  if (!hasVisiblePagePlayer) return false;

  if (command === 'pause') {
    const state = player.getPlayerState ? player.getPlayerState() : null;
    if (window.YT && state === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      persistCurrentPlayback({ playing: false });
    } else {
      player.playVideo();
      persistCurrentPlayback({ playing: true });
    }
    return true;
  }

  if (command === 'stop') {
    stopPlaybackFromMiniPlayer();
    return true;
  }

  if (command === 'volume') {
    player.setVolume(value);
    persistCurrentPlayback({ volume: value });
    return true;
  }

  return false;
};

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

// Initialize
function initOmasVideosPage() {
  if (!document.getElementById('playlists-section')) return;
  switchSection('playlists');
  setupPlayerOverlayClose();
  if (shouldRestoreSavedPlayer()) {
    restoreVisiblePlayerFromSavedState();
  }
  clearInterval(playerStateTimer);
  playerStateTimer = setInterval(() => persistCurrentPlayback(), 3000);
  window.addEventListener('pagehide', persistPlaybackBeforePageChange);
  window.addEventListener('beforeunload', persistPlaybackBeforePageChange);
}

window.initOmasVideosPage = initOmasVideosPage;

document.addEventListener('DOMContentLoaded', initOmasVideosPage);

// YouTube API ready
function onYouTubeIframeAPIReady() {
  if (pendingPlayerRestore) {
    pendingPlayerRestore = false;
    restoreVisiblePlayerFromSavedState();
  }
}
