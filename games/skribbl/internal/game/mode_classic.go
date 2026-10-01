package game

import (
	"math/rand/v2"
	"time"
)

func init() {
	RegisterGameMode(&ClassicModeHandler{})
}

// ClassicModeHandler implements the standard Skribbl experience:
// The drawer selects a word from randomly generated options and draws it.
type ClassicModeHandler struct {
	BaseGameMode
}

func (c *ClassicModeHandler) ID() string {
	return WordSelectModeClassic
}

func (c *ClassicModeHandler) NameKey() string {
	return "game-mode-classic-name"
}

func (c *ClassicModeHandler) DescriptionKey() string {
	return "game-mode-classic-desc"
}

func (c *ClassicModeHandler) StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason) {
	lobby.wordChoice = GetRandomWords(lobby.WordsPerTurn, lobby)
	lobby.preSelectedWord = rand.IntN(len(lobby.wordChoice))

	wordChoiceDuration := 30

	lobby.Broadcast(&Event{
		Type: EventTypeNextTurn,
		Data: &NextTurn{
			Round:          lobby.Round,
			Players:        lobby.players,
			ChoiceTimeLeft: wordChoiceDuration * 1000,
			PreviousWord:   previousWord,
			RoundEndReason: currentRoundEndReason,
			GuesserPhase:   false,
			GameMode:       c.ID(),
		},
	})

	_ = lobby.WriteObject(newDrawer, &Event{
		Type: EventTypeYourTurn,
		Data: &YourTurn{
			Words:           lobby.wordChoice,
			PreSelectedWord: lobby.preSelectedWord,
			TimeLeft:        wordChoiceDuration * 1000,
			GameMode:        c.ID(),
		},
	})

	lobby.wordChoiceEndTime = time.Now().Add(time.Duration(wordChoiceDuration) * time.Second)
	lobby.timeLeftTicker = time.NewTicker(1 * time.Second)
	go startTurnTimeTicker(lobby, lobby.timeLeftTicker)
}

func (c *ClassicModeHandler) OnTick(lobby *Lobby) bool {
	if lobby.CurrentWord == "" {
		if lobby.wordChoiceEndTime.Before(time.Now()) {
			_ = lobby.selectWord(lobby.preSelectedWord)
		}
		return true
	}
	return false
}

func (c *ClassicModeHandler) OnPlayerConnect(lobby *Lobby, player *Player) {
	if player.State == Drawing && lobby.CurrentWord == "" {
		lobby.SendYourTurnEvent(player)
	}
}
