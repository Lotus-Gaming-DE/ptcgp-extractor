
# Format der JSON-Dateien

Das Skript `src/export.ts` erzeugt zwei Dateien im Verzeichnis `data/`:

- **`cards.json`** – enthält eine Liste aller Karten.
- **`sets.json`** – enthält Informationen zu allen Sets bzw. Boostern.

Beide Dateien liegen als Arrays vor, sodass sie unabhängig voneinander eingelesen werden können. Seit Version 1.1 werden die Quelldateien parallel eingelesen, was die Ausführung beschleunigt.

## Karten

`cards` enthält die eigentlichen Karteneinträge. Sie besitzen im Wesentlichen die gleichen Felder wie die Originaldaten aus [`tcgdex/cards-database`](https://github.com/tcgdex/cards-database) und zusätzlich einige Hilfsfelder. Zur schnellen Zuordnung ist `set_id` direkt auf Kartenebene abgelegt. Ein vollständiges `set`-Objekt wird nicht mehr gespeichert.

Wichtige Felder eines Karteneintrags:

- `set_id`: Die Set-ID als String (entspricht der ID im zugehörigen Set)
- `name`: Kartennamen in verschiedenen Sprachen
- `illustrator`, `rarity`, `category`, `hp`, `types`, `stage`, `suffix` usw.
- `boosters`: Liste der Booster-IDs, in denen die Karte erscheint (optional)

Die genaue Struktur kann je nach Karte variieren, da auch Attacken, Fähigkeiten und andere optionale Felder enthalten sind.

## Packs

Im Abschnitt `sets` finden sich Informationen zu jedem Boosterpack beziehungsweise Kartenset. Die Objekte werden über ihre ID angesprochen und enthalten Namen in mehreren Sprachen sowie Zusatzinformationen wie `releaseDate` oder `cardCount`. Innerhalb eines Sets gibt es zudem die Auflistung `boosters`, die die unterschiedlichen Pack-Varianten beschreibt.
Dabei wird das `serie`-Feld aus den tcgdex-Set-Dateien bewusst entfernt, da es für die Pocket-Daten keine Relevanz hat.

Ein minimales Pack-Objekt sieht so aus:

```json
{
  "id": "A2",
  "name": { "en": "Space-Time Smackdown" },
  "boosters": {
    "dialga": { "name": { "en": "Dialga" } },
    "palkia": { "name": { "en": "Palkia" } }
  }
}
```

## Beispiel
```json
{
  "name": { "en": "Arceus ex", "de": "Arceus-ex" },
  "illustrator": "PLANETA CG Works",
  "rarity": "Crown",
  "types": ["Colorless"],
  "set_id": "A2a",
  "boosters": ["dialga", "palkia"]
}
```

## Hinweise für Verbraucher

- Die Datei kann sehr groß werden. Wer nur einige Felder benötigt, kann beim Einlesen nicht relevante Eigenschaften ignorieren.
- Das Feld `set_id` ist rein zur Bequemlichkeit vorhanden und entspricht exakt den Angaben im zugehörigen Set.
- Über das Feld `boosters` lässt sich ermitteln, in welchem Pack eine Karte erscheint. Die tatsächlichen Namen der Boosterpacks stehen im `sets`-Abschnitt.
- Bei zukünftigen Änderungen des Skripts kann sich die Struktur anpassen. Anwendungen sollten daher möglichst fehlertolerant parsen.
