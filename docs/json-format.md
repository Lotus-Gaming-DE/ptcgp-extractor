
# Format der JSON-Dateien

Das Skript `src/export.ts` erzeugt zwei Dateien im Verzeichnis `data/`:

- **`cards.json`** – enthält eine Liste aller Karten.
- **`sets.json`** – enthält Informationen zu allen Sets bzw. Boostern.

Beide Dateien liegen als Arrays vor, sodass sie unabhängig voneinander eingelesen werden können.

## Karten

`cards` enthält die eigentlichen Karteneinträge. Sie besitzen im Wesentlichen die gleichen Felder wie die Originaldaten aus [`tcgdex/cards-database`](https://github.com/tcgdex/cards-database) und zusätzlich einige Hilfsfelder. Das zugehörige Set steht wie bisher unter `set`. Zur schnelleren Filterung sind `set_id` und `set_name` nochmals auf Kartenebene abgelegt.

Wichtige Felder eines Karteneintrags:

- `set`: Vollständiges Objekt mit Informationen zum Set (ID, Name in mehreren Sprachen, Serie, Release-Datum usw.)
- `set_id`: Die Set-ID als String (identisch zu `set.id`)
- `set_name`: Der englische Name des Sets (identisch zu `set.name.en`)
- `name`: Kartennamen in verschiedenen Sprachen
- `illustrator`, `rarity`, `category`, `hp`, `types`, `stage`, `suffix` usw.
- `boosters`: Liste der Booster-IDs, in denen die Karte erscheint

Die genaue Struktur kann je nach Karte variieren, da auch Attacken, Fähigkeiten und andere optionale Felder enthalten sind.

## Packs

Im Abschnitt `sets` finden sich Informationen zu jedem Boosterpack beziehungsweise Kartenset. Die Objekte werden über ihre ID angesprochen und enthalten Namen in mehreren Sprachen sowie Zusatzinformationen wie `releaseDate` oder `cardCount`. Innerhalb eines Sets gibt es zudem die Auflistung `boosters`, die die unterschiedlichen Pack-Varianten beschreibt.

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
  "set": {
    "id": "A2a",
    "name": {
      "de": "Licht des Triumphs",
      "en": "Triumphant Light"
    },
    "serie": { "id": "tcgp", "name": { "en": "Pokémon TCG Pocket" } },
    "cardCount": { "official": 75 },
    "releaseDate": "2025-02-28"
  },
  "name": { "en": "Arceus ex", "de": "Arceus-ex" },
  "illustrator": "PLANETA CG Works",
  "rarity": "Crown",
  "types": ["Colorless"],
  "set_id": "A2a",
  "set_name": "Triumphant Light",
  "boosters": ["dialga", "palkia"]
}
```

## Hinweise für Verbraucher

- Die Datei kann sehr groß werden. Wer nur einige Felder benötigt, kann beim Einlesen nicht relevante Eigenschaften ignorieren oder das `set`-Objekt entfernen.
- Die Felder `set_id` und `set_name` sind rein zur Bequemlichkeit vorhanden und entsprechen exakt den Angaben im `set`-Objekt.
- Über das Feld `boosters` lässt sich ermitteln, in welchem Pack eine Karte erscheint. Die tatsächlichen Namen der Boosterpacks stehen im `sets`-Abschnitt.
- Bei zukünftigen Änderungen des Skripts kann sich die Struktur anpassen. Anwendungen sollten daher möglichst fehlertolerant parsen.
