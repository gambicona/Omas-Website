# Omas Videos

Eine einfache, seniorenfreundliche Website zum Ansehen ausgewählter YouTube-Videos.

## Beschreibung

Diese Website ermöglicht es, YouTube-Videos einfach anzusehen, ohne die Komplexität der YouTube-Seite. Sie ist optimiert für Desktop-Browser und bietet eine große, lesbare Oberfläche mit großen Buttons.

## Funktionen

- Anzeige einer Liste von Videos
- Abspielen von Videos in einem eingebetteten Player
- Speichern von Favoriten im Browser (localStorage)
- Einfache Navigation zwischen allen Videos, Favoriten und Spielen (Platzhalter)

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

## YouTube-Video-IDs ersetzen

1. Öffnen Sie `videos.js`.
2. Suchen Sie die `youtubeId`-Felder mit "REPLACE_WITH_YOUTUBE_ID".
3. Ersetzen Sie diese mit Ihren YouTube-Video-IDs.
   - Beispiel: Für https://www.youtube.com/watch?v=ABC123 ist die ID "ABC123".
4. Aktualisieren Sie auch die `thumbnail`-URLs entsprechend.

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
