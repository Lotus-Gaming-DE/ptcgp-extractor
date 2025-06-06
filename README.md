# PTCGP Data Extraction

Dieses Projekt extrahiert Karten aus dem Bereich **Pokémon TCG Pocket** des Open-Source-Repositories [tcgdex/cards-database](https://github.com/tcgdex/cards-database) und stellt sie als JSON bereit. Das JSON wird für weitere Projekte wie Discord-Bots oder mobile Apps genutzt.

## Voraussetzungen

- Benötigt wird **Node.js 20** (siehe GitHub Action)
- Bitte aktualisiere die Dokumentation, wenn sich Funktionen oder Verhalten 
  ändern.

## Projektüberblick

- **Quelle**: Unter `tcgdex/data/Pokémon TCG Pocket/` befinden sich Set-Dateien und Karten-Dateien (.ts)
- **Skript**: `src/export.ts` liest die Dateien und erzeugt `data/cards.json` im Format `{ sets: [...], cards: [...] }`.
- **Automatisierung**: 
  - Mit GitHub Actions wird bei jedem Push, per Button und wöchentlich ein Workflow ausgeführt.
  - Der Workflow klont `tcgdex/cards-database`, führt das Skript aus und committet das aktualisierte JSON zurück.

## Installation & Nutzung

1. Repository clonen und ins Verzeichnis wechseln.
2. Das Fremd-Repo klonen:
   ```bash
   git clone https://github.com/tcgdex/cards-database tcgdex
   ```
   Das Skript erwartet standardmäßig einen Ordner `tcgdex` im Projektverzeichnis. 
   Falls du einen anderen Pfad verwendest, kannst du ihn über die Umgebungsvariable 
   `TCGDEX_DIR` oder beim Aufruf mit `--tcgdex <pfad>` angeben.
3. Abhängigkeiten installieren, Build erzeugen und Export starten:
   ```bash
   npm install
   npm run build
   npm run export
   ```
4. Das Ergebnis liegt in `data/cards.json` und enthält sowohl Sets als auch Karten.

## Codequalität prüfen

Um sicherzustellen, dass dein Beitrag den Stilvorgaben entspricht und alle Tests bestehen, kannst du folgende Befehle nutzen:

```bash
npm run lint
npm test
```

## GitHub Actions

Siehe `.github/workflows/export.yml` für den vollständigen Ablauf. Der Workflow läuft automatisch und aktualisiert das JSON im Repository.

## Weiterführende Ideen

- Validierung der generierten Daten
- Bereitstellung einer API für Bots oder Apps
- Automatischer Abgleich neuer Sets

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE). Es nutzt Daten aus
[tcgdex/cards-database](https://github.com/tcgdex/cards-database), das ebenfalls
unter der [MIT-Lizenz](https://github.com/tcgdex/cards-database/blob/master/LICENSE)
veröffentlicht wird.

