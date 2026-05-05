// time-weather.js

const KIEL_WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast' +
  '?latitude=54.3233' +
  '&longitude=10.1228' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max' +
  '&timezone=Europe%2FBerlin' +
  '&forecast_days=4';

document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  loadWeather();
});

function updateClock() {
  const now = new Date();

  const dateDisplay = document.getElementById('date-display');
  const digitalClock = document.getElementById('digital-clock');

  const dateText = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const timeText = now.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  if (dateDisplay) {
    dateDisplay.textContent = dateText;
  }

  if (digitalClock) {
    digitalClock.textContent = timeText;
  }

  updateAnalogClock(now);
}

function updateAnalogClock(now) {
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDegrees = seconds * 6;
  const minuteDegrees = minutes * 6 + seconds * 0.1;
  const hourDegrees = (hours % 12) * 30 + minutes * 0.5;

  if (secondHand) {
    secondHand.style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;
  }

  if (minuteHand) {
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
  }

  if (hourHand) {
    hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
  }
}

async function loadWeather() {
  const todayContainer = document.getElementById('weather-today');
  const nextDaysContainer = document.getElementById('weather-next-days');

  try {
    const response = await fetch(KIEL_WEATHER_URL);

    if (!response.ok) {
      throw new Error('Wetter konnte nicht geladen werden.');
    }

    const data = await response.json();

    renderWeather(data);
  } catch (error) {
    if (todayContainer) {
      todayContainer.innerHTML = `
        <p>Das Wetter konnte gerade nicht geladen werden.</p>
        <p>Bitte später noch einmal versuchen.</p>
      `;
    }

    if (nextDaysContainer) {
      nextDaysContainer.innerHTML = '';
    }
  }
}

function renderWeather(data) {
  const daily = data.daily;

  if (!daily || !daily.time || daily.time.length === 0) {
    return;
  }

  const today = getWeatherDay(daily, 0);

  const todayContainer = document.getElementById('weather-today');
  const nextDaysContainer = document.getElementById('weather-next-days');

  if (todayContainer) {
    todayContainer.innerHTML = `
      <div class="weather-today-box">
        <div class="weather-icon-large">${getWeatherIcon(today.code)}</div>

        <div>
          <p class="weather-main-text">${getWeatherText(today.code)}</p>
          <p class="weather-temperature">
            ${Math.round(today.min)}°C bis ${Math.round(today.max)}°C
          </p>
          <p class="weather-small-text">
            Regen: ${formatRain(today.rain)}
          </p>
          <p class="weather-small-text">
            Wind: ${Math.round(today.wind)} km/h
          </p>
        </div>
      </div>
    `;
  }

  if (nextDaysContainer) {
    const nextDaysHtml = [1, 2, 3].map(index => {
      const day = getWeatherDay(daily, index);

      return `
        <div class="weather-day-small">
          <div class="weather-day-name">${formatDayName(day.date)}</div>
          <div class="weather-icon-small">${getWeatherIcon(day.code)}</div>
          <div class="weather-day-text">${getWeatherText(day.code)}</div>
          <div class="weather-day-temp">
            ${Math.round(day.min)}°C bis ${Math.round(day.max)}°C
          </div>
        </div>
      `;
    }).join('');

    nextDaysContainer.innerHTML = nextDaysHtml;
  }
}

function getWeatherDay(daily, index) {
  return {
    date: daily.time[index],
    code: daily.weather_code[index],
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    rain: daily.precipitation_sum[index],
    wind: daily.wind_speed_10m_max[index]
  };
}

function formatDayName(dateString) {
  const date = new Date(dateString + 'T12:00:00');

  return date.toLocaleDateString('de-DE', {
    weekday: 'long'
  });
}

function formatRain(value) {
  if (value === 0) {
    return 'kein Regen';
  }

  if (value < 1) {
    return 'wenig Regen';
  }

  return `${Math.round(value)} mm`;
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';

  return '🌡️';
}

function getWeatherText(code) {
  if (code === 0) return 'Sonnig';
  if (code === 1) return 'Meist sonnig';
  if (code === 2) return 'Teilweise bewölkt';
  if (code === 3) return 'Bewölkt';
  if ([45, 48].includes(code)) return 'Nebel';
  if ([51, 53, 55].includes(code)) return 'Leichter Nieselregen';
  if ([56, 57].includes(code)) return 'Gefrierender Nieselregen';
  if ([61, 63].includes(code)) return 'Regen';
  if ([65].includes(code)) return 'Starker Regen';
  if ([66, 67].includes(code)) return 'Gefrierender Regen';
  if ([71, 73].includes(code)) return 'Schnee';
  if ([75, 77].includes(code)) return 'Starker Schnee';
  if ([80, 81, 82].includes(code)) return 'Regenschauer';
  if ([85, 86].includes(code)) return 'Schneeschauer';
  if ([95, 96, 99].includes(code)) return 'Gewitter';

  return 'Wetter';
}