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

  document.addEventListener('click', closeThemeMenuWhenClickingOutside);
});