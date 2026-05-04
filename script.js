// script.js

let currentSection = 'playlists'; // default to playlists
let player;
let currentListId = null;
let currentPlaylistTitle = '';
let currentVideoId = null;
let videoTitleCache = {};
let playlistTitleCache = {};

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

    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title} Thumbnail">
      <h3>${video.title}</h3>
      <button class="play-btn" onclick="playVideo('${video.id}')" aria-label="Video abspielen">Abspielen</button>
      <button class="fav-btn favorited" onclick="toggleFavorite('${video.id}')" aria-label="Aus Favoriten entfernen">Aus Favoriten entfernen</button>
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

    const title = await fetchPlaylistTitle(playlist.listId);

    card.innerHTML = `
      <h3>${title}</h3>
      <button class="play-btn" onclick="(async () => await playPlaylist('${playlist.listId}'))()" aria-label="Playlist abspielen">Abspielen</button>
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
    playlistTitleCache[listId] = data.title;
    return data.title;
  } catch (error) {
    return `Playlist ${listId}`;
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

async function setCurrentPlaylistTitleById(listId) {
  currentPlaylistTitle = await fetchPlaylistTitle(listId);
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
    updatePlaylistMenu();
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
function togglePlaylist() {
  isLoop = false;
  if (currentListId && player) {
    player.loadPlaylist({list: currentListId, listType: 'playlist'});
    updatePlaylistMenu();
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  switchSection('playlists');
});

// YouTube API ready
function onYouTubeIframeAPIReady() {
  // Player will be created when needed
}