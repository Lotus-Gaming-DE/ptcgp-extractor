# Beitrag leisten

Vielen Dank für dein Interesse an diesem Projekt. Bitte beachte beim Arbeiten die folgenden Punkte:

## Voraussetzungen

- Installiere **Node.js 20**.
- Das Export-Skript prüft die Node-Version und beendet sich bei Abweichungen
  mit einer Fehlermeldung.
- Klone das Fremd-Repository [`tcgdex/cards-database`](https://github.com/tcgdex/cards-database) in einen Ordner `tcgdex` im Projektverzeichnis.

## Abläufe

Führe diese Befehle aus, bevor du Änderungen einreichst:

```bash
npm install
npm run build
npm run lint
npm test
# Testabdeckung wird automatisch erzeugt und im Ordner `coverage/` abgelegt
```

Installiere optional die Git-Hooks mit

```bash
pre-commit install
```

damit Format- und Lint-Prüfungen automatisch vor jedem Commit laufen.

## Hinweise

- Dateien unter `data/pers/` dürfen nicht ins Repository gelangen.
