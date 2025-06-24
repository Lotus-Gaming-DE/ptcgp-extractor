# PTCGP Data Extraction

Dieses Projekt extrahiert Karten aus dem Bereich **Pokémon TCG Pocket** des Open-Source-Repositories [tcgdex/cards-database](https://github.com/tcgdex/cards-database) und stellt sie als JSON bereit. Das JSON wird für weitere Projekte wie Discord-Bots oder mobile Apps genutzt.

## Voraussetzungen

- Benötigt wird **Node.js 20 oder neuer** (siehe GitHub Action)
- Das Export-Skript prüft die Node.js-Version. Ist sie zu niedrig,
  wird ein Fehler geworfen und die CLI beendet sich mit Exit-Code 1.
- Bitte aktualisiere die Dokumentation, wenn sich Funktionen oder Verhalten
  ändern.
- Vor dem Export muss ein Klon von `tcgdex/cards-database` im Unterordner
  `tcgdex` vorhanden sein. Fehlt das Verzeichnis, beendet das Skript den Vorgang
  mit einer Fehlermeldung.

## Projektüberblick

- **Quelle**: Unter `tcgdex/data/Pokémon TCG Pocket/` befinden sich Set-Dateien und Karten-Dateien (.ts)
- **Skript**: `src/export.ts` dient als CLI und nutzt Funktionen aus `src/lib.ts`,
  um die Daten zu sammeln und zu schreiben.
  Die Dateien werden mit begrenzter Parallelität (Standard: 10 gleichzeitig) eingelesen,
  was eine gute Balance zwischen Geschwindigkeit und Stabilität bietet.
  Das `serie`-Feld aus den tcgdex-Set-Dateien wird dabei nicht in `sets.json`
  übernommen.
- **Automatisierung**:
  - Mit GitHub Actions wird bei jedem Push, per Button und wöchentlich ein Workflow ausgeführt.
  - Der Workflow klont `tcgdex/cards-database`, führt das Skript aus und committet das aktualisierte JSON zurück.

## Installation & Nutzung

1. Repository clonen und ins Verzeichnis wechseln.
2. Stelle sicher, dass **Node.js 20 oder neuer** installiert ist.
3. Das Fremd-Repo klonen:
   ```bash
   git clone https://github.com/tcgdex/cards-database tcgdex
   ```
   Das Skript erwartet einen Ordner `tcgdex` im Projektverzeichnis. Fehlt er,
   gibt die CLI eine Fehlermeldung aus und beendet sich mit Code 1.
4. Abhängigkeiten installieren, Build erzeugen, Tests ausführen und Export starten:

   ```bash
   npm install
   npm run build
   npm test
npm run export
  ```

4. Das Ergebnis landet in zwei Dateien:
   - `data/cards.json` mit allen Karten
  - `data/sets.json` mit den Set-Informationen

## Umgebungsvariablen

- `TCGDEX_REPO` legt den Pfad zum Klon von `tcgdex/cards-database` fest. Der Pfad
  muss innerhalb des Projektverzeichnisses liegen und vorhanden sein. Symbolische Links nach außerhalb werden abgewiesen. Ist der Ordner nicht vorhanden oder zeigt nach außen, beendet sich das Skript mit einer Fehlermeldung.
- `CONCURRENCY` legt die Anzahl paralleler Ladevorgänge fest (Standard: 10, Maximum: 100).
  Ungültige Eingaben werden ignoriert und auf 10 gesetzt. Werte über 100 werden auf 100 begrenzt.
- `LOG_LEVEL` kann auf `info`, `warn` oder `error` gesetzt werden und steuert die ausgegebene
  Protokolltiefe (Standard: `info`).

## CLI-Optionen

Das Skript akzeptiert zusätzlich zwei Flags:

- `--concurrency` oder `-c` setzt die Parallelität direkt auf der Kommandozeile.
- `--out` oder `-o` legt das Ausgabeverzeichnis der JSON-Dateien fest.
Umgebungsvariablen haben Vorrang, falls beide Varianten verwendet werden.

## Logausgabe

Der Logger schreibt Meldungen mit Zeitstempel und Loglevel auf die Konsole,
etwa `[INFO 2025-06-24T12:00:00.000Z]`. In den Tests werden diese Ausgaben
abgefangen.

## Programmatic API

Seit Version 1.2 stehen zentrale Funktionen auch als Bibliothek unter
`src/lib.ts` zur Verfügung. Damit lassen sich Karten und Sets in eigenen
Skripten verwenden:

```ts
import { getAllSets, getAllCards, writeData } from './src/lib';

const sets = await getAllSets();
const cards = await getAllCards();
await writeData(cards, sets);
```

## Sicherheitshinweis

Das Skript importiert TypeScript-Dateien aus dem externen Repository
`tcgdex/cards-database` und führt deren Code aus. Stelle sicher, dass du diesem
Repository vertraust oder den Inhalt gründlich prüfst, bevor du den Export ausführst.
Ein Blick auf die Commits und ein eigener Testlauf ohne Schreibzugriff können
helfen, ungewollte Änderungen auszuschließen.

## Codequalität prüfen

Um sicherzustellen, dass dein Beitrag den Stilvorgaben entspricht und alle Tests bestehen, kannst du folgende Befehle nutzen:

```bash
npm run lint
npm run format
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
