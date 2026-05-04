// script.js

// Load videos from videos.js
// Assuming videos.js is loaded before this script

let currentVideoIndex = -1;
let currentSection = 'all'; // 'all', 'favorites', 'games'

// Load favorites from localStorage
function loadFavorites() {
  const favs = localStorage.getItem('omasVideosFavorites');
  return favs ? JSON.parse(favs) : [];
}

// Save favorites to localStorage
function saveFavorites(favs) {
  localStorage.setItem('omasVideosFavorites', JSON.stringify(favs));
}

// Toggle favorite
function toggleFavorite(videoId) {
  let favs = loadFavorites();
  if (favs.includes(videoId)) {
    favs = favs.filter(id => id !== videoId);
  } else {
    favs.push(videoId);
  }
  saveFavorites(favs);
  renderVideos();
}

// Check if video is favorite
function isFavorite(videoId) {
  return loadFavorites().includes(videoId);
}

// Render video list
function renderVideos() {
  const container = document.getElementById('video-list');
  container.innerHTML = '';

  let videosToShow = videos;
  if (currentSection === 'favorites') {
    const favs = loadFavorites();
    videosToShow = videos.filter(v => favs.includes(v.id));
    if (videosToShow.length === 0) {
      container.innerHTML = '<p>Sie haben noch keine Favoriten gespeichert.</p>';
      return;
    }
  }

  videosToShow.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';

    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title} Thumbnail">
      <h3>${video.title}</h3>
      <p>${video.description}</p>
      <button class="play-btn" onclick="playVideo('${video.id}')" aria-label="Video abspielen">Abspielen</button>
      <button class="fav-btn ${isFavorite(video.id) ? 'favorited' : ''}" onclick="toggleFavorite('${video.id}')" aria-label="${isFavorite(video.id) ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}">
        ${isFavorite(video.id) ? 'Aus Favoriten entfernen' : 'Als Favorit speichern'}
      </button>
    `;

    container.appendChild(card);
  });
}

// Play video
function playVideo(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  currentVideoIndex = videos.findIndex(v => v.id === videoId);

  const playerSection = document.getElementById('player-section');
  const iframe = document.getElementById('video-iframe');
  iframe.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  playerSection.style.display = 'flex';
}

// Close player
function closePlayer() {
  const playerSection = document.getElementById('player-section');
  const iframe = document.getElementById('video-iframe');
  iframe.src = '';
  playerSection.style.display = 'none';
}

// Next video
function nextVideo() {
  if (currentVideoIndex < videos.length - 1) {
    currentVideoIndex++;
    const nextVid = videos[currentVideoIndex];
    const iframe = document.getElementById('video-iframe');
    iframe.src = `https://www.youtube.com/embed/${nextVid.youtubeId}?autoplay=1`;
  }
}

// Switch section
function switchSection(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(`${section}-section`).style.display = 'block';

  // Update nav buttons
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`nav button[onclick="switchSection('${section}')"]`).classList.add('active');

  if (section === 'all' || section === 'favorites') {
    renderVideos();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderVideos();
  switchSection('all');
});