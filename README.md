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
   pip install -r requirements.txt
   npm run build
   ```

3. Tests ausführen:

   ```bash
   npm test     # Jest-Tests
   PYTHONPATH=. pytest --cov=.  # Python-Tests
   ```

4. Fremd-Repository klonen (falls noch nicht geschehen):

   ```bash
   git clone https://github.com/tcgdex/cards-database tcgdex
   ```

5. Export starten:

   ```bash
   npm run export
   ```

   Alternativ kannst du `python scripts/run_export.py` verwenden, um Variablen
   aus einer `.env`-Datei automatisch zu laden:

   ```bash
    python scripts/run_export.py -- --concurrency 5
   ```

   Das Ergebnis landet in `data/cards.json` und `data/sets.json`.
   Details zum Dateiformat findest du in [docs/json-format.md](docs/json-format.md).

## Utility Scripts

- `scripts/run_export.py` – l\xE4dt optional Variablen aus `.env` und startet
  das Node.js-Exportskript. Aufrufbar via `python scripts/run_export.py`.

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
- `SNYK_TOKEN` – API-Token für Sicherheitsscans.
- `RAILWAY_TOKEN` – Authentifizierung für Railway CLI.
- `RAILWAY_SERVICE` – Service-ID für Logabruf.
- `RAILWAY_PROJECT` – Projekt-ID für Logabruf.

## CLI-Optionen

- `--concurrency`/`-c` – Parallelität direkt über die Kommandozeile setzen.
- `--out`/`-o` – Zielverzeichnis der JSON-Dateien.

## Logformat

Alle Meldungen werden im JSON-Format `{"level","time","msg"}` auf die Konsole
und in `logs/runtime-<YYYY-MM-DD-HH>.json` geschrieben.
Die Dateien rotieren stündlich und werden bis zu zwei Wochen aufbewahrt.
Benutzertexte erscheinen auf Deutsch, interne Texte auf Englisch.
Das Intervall und die maximale Größe lassen sich über `LOG_ROTATION_INTERVAL`
und `LOG_MAX_SIZE` konfigurieren.
Python-Module loggen über `structlog` ebenfalls JSON in dasselbe Verzeichnis.

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
PYTHONPATH=. pytest
```

Die Testabdeckung aus Jest und Pytest muss global mindestens 90 % betragen (Statements,
Branches, Functions und Lines). Unterschreitet ein Pull Request diesen
Wert, bricht die CI-Pipeline ab.

Installiere optional die Git-Hooks per `pre-commit install`, um Format-
und Lint-Prüfungen automatisch vor jedem Commit auszuführen. Neben
Prettier und ESLint laufen dabei auch die Python-Linter **Black**,
**Flake8** und **Ruff** sowie `pip-audit`.

## Continuous Integration

Die GitHub-Actions führen Linting, Pre-commit-Prüfungen (Prettier,
ESLint, Black, Flake8, Ruff und `pip-audit`), Tests und einen
`snyk test`-Scan aus. Vor dem Scan wird das Snyk-CLI installiert.
Da Secrets in Pull Requests von Forks nicht verfügbar sind, läuft
dieser Schritt nur, wenn das `SNYK_TOKEN`-Secret gesetzt ist und der
PR nicht aus einem Fork stammt. So verhindern wir
Authentifizierungsfehler.
Abhängigkeiten und Pre-commit-Umgebungen werden über `actions/cache`
zwischengespeichert. Nach dem Lauf wird `railway logs --follow`
ausgeführt und als `logs/latest_railway.log` hochgeladen. Zusätzlich wird die
Testabdeckung (mindestens 90 %) als Artefakt bereitgestellt und temporäre
Verzeichnisse (`tmp-repo-*`) werden automatisch entfernt.

## Automatische Updates

Dependabot überwacht wöchentlich die npm-Abhängigkeiten und GitHub-Actions-
Workflows und prüft die Python-Abhängigkeiten täglich. Alle automatisch
erzeugten Pull Requests laufen durch die komplette CI mit Linting,
Tests und `pip-audit`.

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE). Es verwendet Daten aus
[tcgdex/cards-database](https://github.com/tcgdex/cards-database).
