# Omas Videos

Eine einfache, seniorenfreundliche Website zum Ansehen ausgewählter YouTube-Videos.

## Beschreibung

Diese Website ermöglicht es, YouTube-Videos einfach anzusehen, ohne die Komplexität der YouTube-Seite. Sie ist optimiert für Desktop-Browser und bietet eine große, lesbare Oberfläche mit großen Buttons.

## Funktionen

- Anzeige von YouTube-Playlists (Videos werden automatisch von YouTube geladen)
- Speichern von Favoriten im Browser (localStorage) für Videos aus Playlists
- Wiedergabe-Modi: Playlist oder Einzelvideo-Schleife
- Einfache Navigation zwischen Favoriten, Playlists und Spielen (Platzhalter)

## Technische Anforderungen

- Reine HTML, CSS und JavaScript
- Kein Build-Prozess, kein Backend
- Funktioniert auf GitHub Pages
- Responsive Design (PC-optimiert)

## Dateien

- `index.html`: Hauptseite
- `style.css`: Stylesheet
- `script.js`: JavaScript für Interaktivität
- `videos.js`: Video-Daten
- `README.md`: Diese Datei

## YouTube-Playlist-IDs ersetzen

Fügen Sie neue Playlists zum `playlists`-Array in `videos.js` hinzu.
Verwenden Sie die Playlist-ID aus der URL, z.B. https://www.youtube.com/playlist?list=ABC123 -> "ABC123" für `listId`.
Die Playlists erscheinen automatisch in der Website und laden Videos dynamisch von YouTube.

## Lokales Testen

1. Öffnen Sie `index.html` direkt in Ihrem Browser.
2. Die Website sollte funktionieren, ohne einen Server zu starten.

## Veröffentlichen auf GitHub Pages

1. Laden Sie das Repository auf GitHub hoch.
2. Gehen Sie zu den Repository-Einstellungen.
3. Scrollen Sie zu "Pages".
4. Wählen Sie "Deploy from a branch" und "main" als Branch.
5. Die Website ist dann unter `https://[Ihr-Benutzername].github.io/[Repository-Name]/` verfügbar.

## Favoriten

Favoriten werden im Browser gespeichert (localStorage). Sie bleiben erhalten, auch nach Schließen und erneuten Öffnen des Browsers. Wenn Sie den Browser-Cache löschen, gehen die Favoriten verloren.

## Zugänglichkeit

- Große Schrift und Buttons
- Hoher Kontrast
- Tastaturzugänglich
- Semantisches HTML
- Sichtbare Fokus-Zustände
