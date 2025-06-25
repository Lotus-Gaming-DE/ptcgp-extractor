# PTCGP Data Extraction

Dieses Projekt extrahiert Karten aus dem Bereich **Pokémon TCG Pocket** des
Open-Source-Repositories [tcgdex/cards-database](https://github.com/tcgdex/cards-database)
und speichert sie als JSON. Die Daten können für Discord-Bots oder mobile Apps
verwendet werden.

## Voraussetzungen

- **Node.js 20 oder neuer**
- Vor dem Export muss ein Klon von `tcgdex/cards-database` im Ordner `tcgdex`
  liegen.

### Sicherheitshinweis

Dieses Projekt verarbeitet ausschließlich öffentlich verfügbare Kartendaten.
Persönliche Daten oder Geheimnisse gehören **nicht** ins Repository. Nutze die
Datei `.env.example` als Vorlage für deine lokale `.env` und versioniere diese
nicht.

## Projektüberblick

- **Quelle:** `tcgdex/data/Pokémon TCG Pocket/`
- **Skript:** `src/export.ts` nutzt Funktionen aus `src/lib.ts`, lädt die Dateien
  parallel (Standard: 10) und entfernt das `serie`-Feld der Sets.
- **Automatisierung:** `.github/workflows/export.yml` führt das Skript wöchentlich
  und bei jedem Push aus und committet die erzeugten JSON-Dateien.

## Installation & Nutzung

1. Repository klonen und ins Verzeichnis wechseln. Kopiere bei Bedarf
   `.env.example` nach `.env`, um Pfade anzupassen.
2. Abhängigkeiten installieren und Build erzeugen:

   ```bash
   npm install
   npm run build
   ```

3. Tests ausführen:

   ```bash
   npm test
   ```

4. Fremd-Repository klonen (falls noch nicht geschehen):

   ```bash
   git clone https://github.com/tcgdex/cards-database tcgdex
   ```

5. Export starten:

   ```bash
   npm run export
   ```

   Alternativ kannst du `scripts/run-export.sh` verwenden, um Variablen aus einer
   `.env`-Datei automatisch zu laden:

   ```bash
   ./scripts/run-export.sh --concurrency 5
   ```

   Das Ergebnis landet in `data/cards.json` und `data/sets.json`.
   Details zum Dateiformat findest du in [docs/json-format.md](docs/json-format.md).

## Umgebungsvariablen

- Kopiere `.env.example` nach `.env`, um eigene Pfade oder Optionen zu
  setzen.

- `TCGDEX_REPO` – Pfad zum Klon von `tcgdex/cards-database`.
- `CONCURRENCY` – Anzahl paralleler Ladevorgänge (Standard: 10, Maximum: 100).
- `LOG_LEVEL` – `info`, `warn` oder `error` (Standard: `info`).
- `LOG_DIR` – Zielverzeichnis für Logdateien (Standard: `logs/`).
- `DEBUG` – Wenn gesetzt, werden nach dem Export die ersten 500 Zeichen der
  erzeugten Dateien geloggt.
- `LOG_ROTATION_INTERVAL` – Intervall für die Logrotation (z.B. `1d`).
- `LOG_MAX_SIZE` – Maximale Größe pro Logdatei (z.B. `1m`).

## CLI-Optionen

- `--concurrency`/`-c` – Parallelität direkt über die Kommandozeile setzen.
- `--out`/`-o` – Zielverzeichnis der JSON-Dateien.

## Logformat

Alle Meldungen werden im JSON-Format `{"level","time","msg"}` auf die Konsole
und in `logs/app-<Datum>.log` geschrieben.
Die Dateien rotieren täglich und werden eine Woche lang aufbewahrt.
Benutzertexte erscheinen auf Deutsch, interne Texte auf Englisch.
Das Intervall und die maximale Größe lassen sich über `LOG_ROTATION_INTERVAL`
und `LOG_MAX_SIZE` konfigurieren.

## Programmatic API

```ts
import { getAllSets, getAllCards, writeData } from './src/lib';

const sets = await getAllSets();
const cards = await getAllCards();
await writeData(cards, sets);
```

## Codequalität prüfen

```bash
npm run lint
npm run format
npm test
```

Installiere optional die Git-Hooks per `pre-commit install`, um
Prettier- und ESLint-Prüfungen automatisch vor jedem Commit auszuführen.
Die Konfiguration beinhaltet keine Python-Checks mehr und ist dadurch
schlanker. Generierte Dateien wie `data/cards.json` werden dabei
ausgenommen.

## Continuous Integration

Die GitHub-Actions führen Linting, Pre-commit-Prüfungen, Tests und einen
`npx snyk test`-Scan aus. Abhängigkeiten und Pre-commit-Umgebungen werden über
`actions/cache` zwischengespeichert. Nach dem Lauf wird `railway logs --follow`
ausgeführt und als `latest_railway.log` hochgeladen. Zusätzlich wird die
Testabdeckung als Artefakt bereitgestellt und temporäre Verzeichnisse
(`tmp-repo-*`) werden automatisch entfernt.

## Automatische Updates

Dependabot überprüft wöchentlich die npm-Abhängigkeiten und GitHub-Actions-
Workflows. Sicherheitsupdates und Warnungen werden direkt über GitHub
bereitgestellt, Pull Requests laufen automatisch durch die CI-Pipeline.

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE). Es verwendet Daten aus
[tcgdex/cards-database](https://github.com/tcgdex/cards-database).
