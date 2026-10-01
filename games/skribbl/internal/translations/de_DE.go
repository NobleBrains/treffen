package translations

func initGermanTranslation() {
	translation := createTranslation()

	translation.put("requires-js", "Diese Website benötigt JavaScript um korrekt zu funktionieren.")

	translation.put("start-the-game", "Mach dich bereit!")
	translation.put("force-start", "Start erzwingen")
	translation.put("force-restart", "Neustart erzwingen")
	translation.put("game-not-started-title", "Warte auf Spielstart")
	translation.put("waiting-for-host-to-start", "Bitte warte bis der Lobby Besitzer das Spiel startet.")

	translation.put("now-spectating-title", "Du schaust nun zu")
	translation.put("now-spectating-text", "Du kannst den Zuschauermodus verlassen, indem du das Auge oben betätigst.")
	translation.put("now-participating-title", "Du nimmst nun teil")
	translation.put("now-participating-text", "Du kannst den Zuschauermodus betreten, indem du das Auge oben betätigst.")

	translation.put("spectation-requested-title", "Zuschauermodus angefragt")
	translation.put("spectation-requested-text", "Nach diesem Zug wirst du zum Zuschauer.")
	translation.put("participation-requested-title", "Teilnahme angefragt")
	translation.put("participation-requested-text", "Nach diesem Zug wirst du wieder teilnehmen.")

	translation.put("spectation-request-cancelled-title", "Zuschauermodusanfrage zurückgezogen")
	translation.put("spectation-request-cancelled-text", "Deine Zuschauermodusanfrage wurde zurückgezogen, du nimmst weiterhin teil.")
	translation.put("participation-request-cancelled-title", "Teilnahmeanfrage zurückgezogen")
	translation.put("participation-request-cancelled-text", "Deine Teilnahmeanfrage wurde zurückgezogen, du schaust weiterhin zu.")

	translation.put("last-turn", "(Letzter Zug: %s)")

	translation.put("round", "Runde")
	translation.put("toggle-soundeffects", "Sound ein- / ausschalten")
	translation.put("toggle-pen-pressure", "Tablet-Stiftdruck ein- / ausschalten")
	translation.put("change-your-name", "Anzeigename")
	translation.put("randomize", "Zufälliger Name")
	translation.put("apply", "Anwenden")
	translation.put("save", "Speichern")
	translation.put("toggle-fullscreen", "Vollbild aktivieren / deaktivieren")
	translation.put("toggle-spectate", "Zuschauermodus aktivieren / deaktivieren")
	translation.put("show-help", "Hilfe anzeigen")
	translation.put("votekick-a-player", "Stimme dafür ab, einen Spieler rauszuwerfen")

	translation.put("change-lobby-settings-tooltip", "Lobby-Einstellungen ändern")
	translation.put("change-lobby-settings-title", "Lobby-Einstellungen")
	translation.put("lobby-settings-changed", "Lobby-Einstelungen verändert")
	translation.put("advanced-settings", "Erweiterte Einstellungen")
	translation.put("chill", "Gemütlich")
	translation.put("competitive", "Wettkampf")
	translation.put("chill-alt", "Zwar wird schnell sein belohnt, aber der Fokus liegt hier eher auf Spaß.")
	translation.put("competitive-alt", "Je schneller du bist, desto mehr Punkte bekommst du. Schnell sein lohnt sich also!")
	translation.put("score-calculation", "Punktsystem")
	translation.put("word-language", "Sprache")
	translation.put("drawing-time-setting", "Zeichenzeit")
	translation.put("rounds-setting", "Runden")
	translation.put("max-players-setting", "Maximale Spieler")
	translation.put("public-lobby-setting", "Öffentliche Lobby")
	translation.put("custom-words", "Extrawörter")
	translation.put("custom-words-info", "Gib hier deine Extrawörter ein und trenne einzelne Wörter mit einem Komma")
	translation.put("custom-words-per-turn-setting", "Extrawörter pro Zug")
	translation.put("players-per-ip-limit-setting", "Maximale Spieler pro IP")
	translation.put("save-settings", "Einstellungen Speichern")
	translation.put("input-contains-invalid-data", "Deine Eingaben enthalten invalide Daten:")
	translation.put("please-fix-invalid-input", "Bitte korrigiere deine Eingaben und versuche es erneut.")
	translation.put("create-lobby", "Lobby erstellen")
	translation.put("create-public-lobby", "Public Lobby erstellen")
	translation.put("create-private-lobby", "Private Lobby erstellen")

	translation.put("refresh", "Aktualisieren")
	translation.put("join-lobby", "Lobby beitreten")

	translation.put("message-input-placeholder", "Antworten und Nachrichten hier eingeben")

	translation.put("word-choice-warning", "Wort, wenn du nicht zeitig wählst")
	translation.put("choose-a-word", "Wähle ein Wort")
	translation.put("waiting-for-word-selection", "Warte auf Wort-Auswahl")
	// This one doesn't use %s, since we want to make one part bold.
	translation.put("is-choosing-word", "wählt gerade ein Wort.")
	translation.put("word-select-mode-setting", "Spielmodus")
	translation.put("word-select-mode-classic", "Klassisch (Zeichner wählt aus)")
	translation.put("word-select-mode-guesser-suggestions", "Rate-Team Vorschläge (Rater schlagen vor)")
	translation.put("game-mode-classic-name", "Klassisch (Zeichner wählt aus)")
	translation.put("game-mode-classic-desc", "Der Zeichner wählt aus zufälligen Wörtern und malt ganz normal.")
	translation.put("game-mode-guesser-suggestions-name", "Rate-Team Vorschläge (Rater schlagen vor)")
	translation.put("game-mode-guesser-suggestions-desc", "Die Rater schlagen Wörter vor, und der Zeichner wählt daraus aus.")
	translation.put("game-mode-blind-drawer-name", "Blinder Zeichner (Zeichner malt blind)")
	translation.put("game-mode-blind-drawer-desc", "Der Zeichner kann seine eigenen Striche nicht sehen – die Rater sehen alles live!")
	translation.put("game-mode-speed-drawing-name", "Blitz-Runde (Halbierte Zeit)")
	translation.put("game-mode-speed-drawing-desc", "Halbierte Malzeit und schnellere Hinweise für extra Tempo und Hektik!")
	translation.put("blind-mode-active-notice", "🙈 Blinder Zeichner aktiv: Du siehst deine eigenen Striche nicht, aber alle anderen sehen sie!")
	translation.put("suggest-a-word", "Wort für den Zeichner vorschlagen")
	translation.put("waiting-for-guesser-selection", "Warte auf Vorschläge des Rate-Teams")
	translation.put("word-submitted-waiting", "Wort vorgeschlagen! Warte auf andere Spieler...")
	translation.put("is-choosing-from-suggestions", "wählt aus den vorgeschlagenen Wörtern.")

	translation.put("close-guess", "'%s' ist nah dran.")
	translation.put("correct-guess", "Du hast das Wort korrekt erraten.")
	translation.put("correct-guess-other-player", "'%s' hat das Wort korrekt erraten.")
	translation.put("round-over", "Zug vorbei, es wurde kein Wort gewählt.")
	translation.put("round-over-no-word", "Zug vorbei, das gewählte Wort war '%s'.")
	translation.put("game-over-win", "Glückwunsch, du hast gewonnen!")
	translation.put("game-over-tie", "Unentschieden!")
	translation.put("game-over", "Du bist %s. mit %s Punkten")

	translation.put("change-active-color", "Ändere die aktive Farbe")
	translation.put("use-pencil", "Stift bentuzen")
	translation.put("use-eraser", "Radiergummi benutzen")
	translation.put("use-fill-bucket", "Fülleimer benutzen (Füllt den Zielbereich mit der gewählten Farbe)")
	translation.put("change-pencil-size-to", "Ändere die Stift / Radiergummi Größe auf %s")
	translation.put("clear-canvas", "Leere die Zeichenfläche")
	translation.put("undo", "Mache deine letzte Änderung ungeschehen (Funktioniert nicht nach \""+translation.Get("clear-canvas")+"\")")

	translation.put("connection-lost", "Verbindung verloren!")
	translation.put("connection-lost-text", "Versuche Verbindung wiederherzustellen"+
		" ...\n\nStelle sicher, dass deine Internetverbindung funktioniert.\nFalls das "+
		"Problem weiterhin besteht, kontaktiere den Webmaster.")
	translation.put("error-connecting", "Fehler beim Verbindungsaufbau")
	translation.put("error-connecting-text",
		"Skribbol war nicht in der Lage eine Socket-Verbindung aufzubauen.\n\nZwar scheint dein "+
			"Internet zu funktionieren, aber entweder wurden der Server oder \ndeine Firewall falsch konfiguriert.\n\n"+
			"Versuche die Seite neu zu laden.")

	translation.put("message-too-long", "Deine Nachricht ist zu lang.")

	// Help dialog
	translation.put("controls", "Steuerung")
	translation.put("pencil", "Stift")
	translation.put("eraser", "Radiergummi")
	translation.put("fill-bucket", "Fülleimer")
	translation.put("switch-pencil-sizes", "Die Stiftgröße kannst du mit den Tasten %s bis %s verändern.")
	translation.put("undo-help-message", "Rückgängig")

	// Generic words
	// "close" as in "closing the window"
	translation.put("close", "Schließen")
	translation.put("no", "Nein")
	translation.put("yes", "Ja")
	translation.put("system", "System")
	translation.put("confirm", "Okay")
	translation.put("ready", "Bereit")
	translation.put("join", "Beitreten")
	translation.put("ongoing", "Läuft")
	translation.put("game-over-lobby", "Spiel vorbei")
	translation.put("forbidden", "Verboten")

	// Lobby & Game events
	translation.put("click-to-homepage", "Hier klicken, um zur Startseite zurückzukehren")
	translation.put("drawer-kicked", "Da der gekickte Spieler am Zeichnen war, erhält in dieser Runde niemand Punkte.")
	translation.put("self-kicked", "Du wurdest gekickt")
	translation.put("kick-vote", "(%s/%s) Spieler haben dafür gestimmt, %s zu kicken.")
	translation.put("player-kicked", "Spieler wurde gekickt.")
	translation.put("owner-change", "%s ist der neue Lobby-Besitzer.")
	translation.put("custom-words-placeholder", "Kommagetrennte, Liste, von, Wörtern, hier")
	translation.put("words-per-turn-setting", "Wörter pro Runde")
	translation.put("no-lobbies-yet", "Es gibt noch keine Lobbys.")
	translation.put("lobby-full", "Entschuldigung, aber die Lobby ist voll.")
	translation.put("lobby-ip-limit-excceeded", "Du hast die maximale Anzahl an Verbindungen pro IP erreicht.")
	translation.put("lobby-open-tab-exists", "Du hast anscheinend bereits einen Tab für diese Lobby geöffnet.")
	translation.put("lobby-doesnt-exist", "Die angeforderte Lobby existiert nicht")
	translation.put("drawer-disconnected", "Runde vorzeitig beendet, Zeichner hat die Verbindung getrennt.")
	translation.put("guessers-disconnected", "Runde vorzeitig beendet, Rater haben die Verbindung getrennt.")
	translation.put("word-hint-revealed", "Ein Buchstabenhinweis wurde aufgedeckt!")
	translation.put("server-shutting-down-title", "Server fährt herunter")
	translation.put("server-shutting-down-text", "Entschuldigung, aber der Server wird in Kürze heruntergefahren. Bitte versuche es später erneut.")

	// Footer
	translation.put("source-code", "Source Code")
	translation.put("help", "Hilfe")
	translation.put("submit-feedback", "Feedback")
	translation.put("stats", "Status")

	RegisterTranslation("de", translation)
}
