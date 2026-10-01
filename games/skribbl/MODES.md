# 🎮 Skribbol – Game Mode Framework Guide

Das Skribbol Game Mode Framework ermöglicht es, neue Spielmodi modular, sauber getrennt und ohne Eingriffe in den bestehenden HTML- oder Core-Code hinzuzufügen.

---

## 🚀 Übersicht der integrierten Modi

1. **Klassisch (`classic`)**:
   Standard-Modus – der Zeichner wählt aus zufälligen Wörtern und zeichnet. Rater raten ganz normal.
2. **Rate-Team Vorschläge (`guesser_suggestions`)**:
   Vor dem Zug schlagen die Rater Wörter vor. Der Zeichner wählt anschließend eines der vorgeschlagenen Wörter aus.
3. **Blinder Zeichner (`blind_drawer`)**:
   Der Zeichner sieht seine eigenen Striche auf der Zeichenfläche nicht ("Blindzeichnung") – alle Rater sehen die Striche jedoch live!
4. **Blitz-Runde (`speed_drawing`)**:
   Halbierte Malzeit (z. B. 30s) und doppelt so schnelle Hinweise für maximale Hektik.

---

## 🛠️ Einen neuen Spielmodus erstellen (in 3 Schritten)

### 1. Datei anlegen: `internal/game/mode_meinmodus.go`

Jeder Modus kann einfach `BaseGameMode` einbetten. Dadurch müssen nur die Methoden implementiert werden, die der Modus tatsächlich verändern möchte.

```go
package game

func init() {
    RegisterGameMode(&MeinModusHandler{})
}

type MeinModusHandler struct {
    BaseGameMode
}

// Eindeutige ID (z.B. "mein_modus")
func (m *MeinModusHandler) ID() string {
    return "mein_modus"
}

// Übersetzungsschlüssel für den Namen im Dropdown
func (m *MeinModusHandler) NameKey() string {
    return "game-mode-mein-modus-name"
}

// Übersetzungsschlüssel für den Tooltip / die Beschreibung
func (m *MeinModusHandler) DescriptionKey() string {
    return "game-mode-mein-modus-desc"
}

// Optional: Rundenzeit manipulieren (z. B. für Speed-Modi)
func (m *MeinModusHandler) ModifyDrawingDuration(lobby *Lobby, baseDuration int) int {
    return baseDuration / 2
}
```

### 2. Verfügbare Lifecycle-Hooks

Ein `GameModeHandler` kann folgende Hooks implementieren:

| Hook | Zweck |
|---|---|
| `ID() string` | Eindeutige ID des Modus |
| `NameKey() string` | i18n Translation Key für den Anzeigenamen |
| `DescriptionKey() string` | i18n Translation Key für die Beschreibung/Tooltip |
| `NewState() any` | Erstellt länderspezifischen / lobby-spezifischen State für den Modus |
| `StartTurn(...)` | Startet den Zug (Wortauswahl, Vorrunden etc.) |
| `OnTick(lobby *Lobby) bool` | Hook für den 1-Sekunden-Timer (z. B. für Countdowns vor dem Malen) |
| `HandleEvent(...)` | Verarbeitet eigene WebSocket-Events für diesen Modus |
| `OnPlayerConnect(...)` | Synchronisiert Modus-State bei Reconnects |
| `OnPlayerDisconnect(...)` | Reagiert auf Disconnects während spezieller Phasen |
| `OnGameStart(lobby *Lobby)` | Wird aufgerufen, wenn das Spiel gestartet wird |
| `OnTurnEnd(lobby *Lobby)` | Wird aufgerufen, wenn ein Mal-Zug endet |
| `OnRoundEnd(lobby *Lobby)` | Wird aufgerufen, wenn eine komplette Runde endet |
| `OnGameOver(lobby *Lobby)` | Wird aufgerufen, wenn das Spiel endet |
| `ModifyDrawingDuration(...)` | Passt die effektive Malzeit an |

### 3. Texte übersetzen

In [`internal/translations/de_DE.go`](file:///var/home/lukhicken/AGY/Skribbol/scribble.rs-master/internal/translations/de_DE.go) und [`internal/translations/en_us.go`](file:///var/home/lukhicken/AGY/Skribbol/scribble.rs-master/internal/translations/en_us.go) die beiden Keys eintragen:

```go
translation.put("game-mode-mein-modus-name", "Mein Modus")
translation.put("game-mode-mein-modus-desc", "Beschreibung für den Spieleabend...")
```

🎉 **Fertig!** Sobald der Modus via `RegisterGameMode` registriert ist, erscheint er **automatisch** und **ohne HTML-Änderungen**:
- auf der Startseite bei der Lobby-Erstellung
- in den In-Game Lobby-Einstellungen
- in der API-Validierung
