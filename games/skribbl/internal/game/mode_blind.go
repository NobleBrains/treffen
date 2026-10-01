package game

import (
	"math/rand/v2"
	"time"
)

func init() {
	RegisterGameMode(&BlindDrawerModeHandler{})
}

// BlindDrawerModeHandler implements a hilarious mode where the drawer cannot see
// their own strokes on canvas, while guessers see the drawing in real-time.
type BlindDrawerModeHandler struct {
	BaseGameMode
}

func (b *BlindDrawerModeHandler) ID() string {
	return GameModeBlindDrawer
}

func (b *BlindDrawerModeHandler) NameKey() string {
	return "game-mode-blind-drawer-name"
}

func (b *BlindDrawerModeHandler) DescriptionKey() string {
	return "game-mode-blind-drawer-desc"
}

func (b *BlindDrawerModeHandler) StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason) {
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
			GameMode:       b.ID(),
		},
	})

	_ = lobby.WriteObject(newDrawer, &Event{
		Type: EventTypeYourTurn,
		Data: &YourTurn{
			Words:           lobby.wordChoice,
			PreSelectedWord: lobby.preSelectedWord,
			TimeLeft:        wordChoiceDuration * 1000,
			GameMode:        b.ID(),
		},
	})

	lobby.wordChoiceEndTime = time.Now().Add(time.Duration(wordChoiceDuration) * time.Second)
	lobby.timeLeftTicker = time.NewTicker(1 * time.Second)
	go startTurnTimeTicker(lobby, lobby.timeLeftTicker)
}

func (b *BlindDrawerModeHandler) OnTick(lobby *Lobby) bool {
	if lobby.CurrentWord == "" {
		if lobby.wordChoiceEndTime.Before(time.Now()) {
			_ = lobby.selectWord(lobby.preSelectedWord)
		}
		return true
	}
	return false
}

func (b *BlindDrawerModeHandler) OnPlayerConnect(lobby *Lobby, player *Player) {
	if player.State == Drawing && lobby.CurrentWord == "" {
		lobby.SendYourTurnEvent(player)
	}
}

func (b *BlindDrawerModeHandler) ShouldDrawerReceiveDrawing() bool {
	return false
}
