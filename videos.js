// videos.js
// Hier sind die Videos gespeichert. Ersetzen Sie die 'REPLACE_WITH_YOUTUBE_ID' mit Ihren eigenen YouTube-Video-IDs.
// Sie können die YouTube-ID aus der URL des Videos kopieren, z.B. https://www.youtube.com/watch?v=ABC123 -> ABC123

const videos = [
  {
    id: "family-video",
    title: "Familienvideo",
    description: "Ein schönes Video für die Familie.",
    youtubeId: "REPLACE_WITH_YOUTUBE_ID",
    thumbnail: "https://img.youtube.com/vi/REPLACE_WITH_YOUTUBE_ID/hqdefault.jpg"
  },
  {
    id: "favorite-song",
    title: "Lieblingslied",
    description: "Ein Lied zum Anhören.",
    youtubeId: "REPLACE_WITH_YOUTUBE_ID",
    thumbnail: "https://img.youtube.com/vi/REPLACE_WITH_YOUTUBE_ID/hqdefault.jpg"
  },
  {
    id: "vacation-video",
    title: "Urlaubsvideo",
    description: "Ein schönes Urlaubsvideo.",
    youtubeId: "REPLACE_WITH_YOUTUBE_ID",
    thumbnail: "https://img.youtube.com/vi/REPLACE_WITH_YOUTUBE_ID/hqdefault.jpg"
  }
];

// Playlists
// Fügen Sie hier Ihre Playlists hinzu. Die Videos in den Playlists werden automatisch von YouTube geladen.
// Ersetzen Sie 'LIST_ID' mit der Playlist-ID aus der URL, z.B. https://www.youtube.com/playlist?list=ABC123 -> ABC123

const playlists = [
  {
    id: "playlist1",
    title: "Meine erste Playlist",
    description: "Eine Sammlung von Videos.",
    listId: "PLNpzyHo90zfvRIJlSi4YwobkK7mq5TuaO"
  },
  {
    id: "playlist2",
    title: "Meine zweite Playlist",
    description: "Weitere Videos.",
    listId: "PLNpzyHo90zfuePkto6jaTDpc3HcS8MKZl"
  }
];