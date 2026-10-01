package game

import (
	"math/rand/v2"
	"time"
)

func init() {
	RegisterGameMode(&SpeedDrawingModeHandler{})
}

// SpeedDrawingModeHandler implements high-speed rounds with halved drawing time,
// faster word choice, and rapid hint revelation.
type SpeedDrawingModeHandler struct {
	BaseGameMode
}

func (s *SpeedDrawingModeHandler) ID() string {
	return GameModeSpeedDrawing
}

func (s *SpeedDrawingModeHandler) NameKey() string {
	return "game-mode-speed-drawing-name"
}

func (s *SpeedDrawingModeHandler) DescriptionKey() string {
	return "game-mode-speed-drawing-desc"
}

func (s *SpeedDrawingModeHandler) ModifyDrawingDuration(lobby *Lobby, baseDuration int) int {
	half := baseDuration / 2
	if half < 20 {
		return 20
	}
	return half
}

func (s *SpeedDrawingModeHandler) StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason) {
	lobby.wordChoice = GetRandomWords(lobby.WordsPerTurn, lobby)
	lobby.preSelectedWord = rand.IntN(len(lobby.wordChoice))

	wordChoiceDuration := 15

	lobby.Broadcast(&Event{
		Type: EventTypeNextTurn,
		Data: &NextTurn{
			Round:          lobby.Round,
			Players:        lobby.players,
			ChoiceTimeLeft: wordChoiceDuration * 1000,
			PreviousWord:   previousWord,
			RoundEndReason: currentRoundEndReason,
			GuesserPhase:   false,
			GameMode:       s.ID(),
		},
	})

	_ = lobby.WriteObject(newDrawer, &Event{
		Type: EventTypeYourTurn,
		Data: &YourTurn{
			Words:           lobby.wordChoice,
			PreSelectedWord: lobby.preSelectedWord,
			TimeLeft:        wordChoiceDuration * 1000,
			GameMode:        s.ID(),
		},
	})

	lobby.wordChoiceEndTime = time.Now().Add(time.Duration(wordChoiceDuration) * time.Second)
	lobby.timeLeftTicker = time.NewTicker(1 * time.Second)
	go startTurnTimeTicker(lobby, lobby.timeLeftTicker)
}

func (s *SpeedDrawingModeHandler) OnTick(lobby *Lobby) bool {
	if lobby.CurrentWord == "" {
		if lobby.wordChoiceEndTime.Before(time.Now()) {
			_ = lobby.selectWord(lobby.preSelectedWord)
		}
		return true
	}
	return false
}

func (s *SpeedDrawingModeHandler) OnPlayerConnect(lobby *Lobby, player *Player) {
	if player.State == Drawing && lobby.CurrentWord == "" {
		lobby.SendYourTurnEvent(player)
	}
}
