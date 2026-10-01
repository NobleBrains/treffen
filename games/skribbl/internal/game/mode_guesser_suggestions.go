package game

import (
	"encoding/json"
	"errors"
	"fmt"
	"math/rand/v2"
	"strings"
	"time"

	"github.com/gofrs/uuid/v5"
)

func init() {
	RegisterGameMode(&GuesserSuggestionsModeHandler{})
}

type guesserSuggestionsState struct {
	isGuesserPhase          bool
	guesserWordChoices      map[uuid.UUID][]string
	guesserPreSelectedWords map[uuid.UUID]int
	guesserChosenWords      map[uuid.UUID]string
	guesserPhaseEndTime     time.Time
}

// GuesserSuggestionsModeHandler implements a collaborative mode where guessers
// propose candidate words for the drawer to choose from.
type GuesserSuggestionsModeHandler struct {
	BaseGameMode
}

func (g *GuesserSuggestionsModeHandler) ID() string {
	return WordSelectModeGuesserSuggestions
}

func (g *GuesserSuggestionsModeHandler) NameKey() string {
	return "game-mode-guesser-suggestions-name"
}

func (g *GuesserSuggestionsModeHandler) DescriptionKey() string {
	return "game-mode-guesser-suggestions-desc"
}

func (g *GuesserSuggestionsModeHandler) NewState() any {
	return &guesserSuggestionsState{
		guesserWordChoices:      make(map[uuid.UUID][]string),
		guesserPreSelectedWords: make(map[uuid.UUID]int),
		guesserChosenWords:      make(map[uuid.UUID]string),
	}
}

func getGuesserState(lobby *Lobby) *guesserSuggestionsState {
	state, ok := lobby.modeState.(*guesserSuggestionsState)
	if !ok || state == nil {
		state = &guesserSuggestionsState{
			guesserWordChoices:      make(map[uuid.UUID][]string),
			guesserPreSelectedWords: make(map[uuid.UUID]int),
			guesserChosenWords:      make(map[uuid.UUID]string),
		}
		lobby.modeState = state
	}
	return state
}

func (g *GuesserSuggestionsModeHandler) StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason) {
	guessers := lobby.GetEligibleGuessers()
	if len(guessers) == 0 {
		// Fallback to classic drawer choice if there are no eligible guessers
		(&ClassicModeHandler{}).StartTurn(lobby, newDrawer, previousWord, currentRoundEndReason)
		return
	}

	state := getGuesserState(lobby)
	state.isGuesserPhase = true
	state.guesserWordChoices = make(map[uuid.UUID][]string)
	state.guesserPreSelectedWords = make(map[uuid.UUID]int)
	state.guesserChosenWords = make(map[uuid.UUID]string)

	guesserDuration := 20
	state.guesserPhaseEndTime = time.Now().Add(time.Duration(guesserDuration) * time.Second)

	lobby.Broadcast(&Event{
		Type: EventTypeNextTurn,
		Data: &NextTurn{
			Round:          lobby.Round,
			Players:        lobby.players,
			ChoiceTimeLeft: guesserDuration * 1000,
			PreviousWord:   previousWord,
			RoundEndReason: currentRoundEndReason,
			GuesserPhase:   true,
			GameMode:       g.ID(),
		},
	})

	for _, guesser := range guessers {
		words := GetRandomWords(lobby.WordsPerTurn, lobby)
		pre := rand.IntN(len(words))
		state.guesserWordChoices[guesser.ID] = words
		state.guesserPreSelectedWords[guesser.ID] = pre
		_ = lobby.WriteObject(guesser, &Event{
			Type: EventTypeSuggestWords,
			Data: &SuggestWords{
				Words:           words,
				PreSelectedWord: pre,
				TimeLeft:        guesserDuration * 1000,
				DrawerName:      newDrawer.Name,
			},
		})
	}

	lobby.timeLeftTicker = time.NewTicker(1 * time.Second)
	go startTurnTimeTicker(lobby, lobby.timeLeftTicker)
}

func (g *GuesserSuggestionsModeHandler) OnTick(lobby *Lobby) bool {
	state := getGuesserState(lobby)
	if state.isGuesserPhase {
		if state.guesserPhaseEndTime.Before(time.Now()) {
			for guesserID, words := range state.guesserWordChoices {
				if _, chosen := state.guesserChosenWords[guesserID]; !chosen {
					pre := state.guesserPreSelectedWords[guesserID]
					if len(words) > 0 {
						state.guesserChosenWords[guesserID] = words[pre]
					}
				}
			}
			g.transitionToDrawerWordChoice(lobby)
		}
		return true
	}

	if lobby.CurrentWord == "" {
		if lobby.wordChoiceEndTime.Before(time.Now()) {
			_ = lobby.selectWord(lobby.preSelectedWord)
		}
		return true
	}

	return false
}

func (g *GuesserSuggestionsModeHandler) HandleEvent(lobby *Lobby, player *Player, eventType string, payload []byte) (bool, error) {
	if eventType == EventTypeChooseGuesserWord {
		var wordChoice IntDataEvent
		if err := json.Unmarshal(payload, &wordChoice); err != nil {
			return true, fmt.Errorf("error decoding data: %w", err)
		}
		err := g.handleGuesserWordChoice(lobby, player, wordChoice.Data)
		return true, err
	}
	return false, nil
}

func (g *GuesserSuggestionsModeHandler) OnPlayerConnect(lobby *Lobby, player *Player) {
	state := getGuesserState(lobby)
	if player.State == Drawing && lobby.CurrentWord == "" && !state.isGuesserPhase {
		lobby.SendYourTurnEvent(player)
	}

	if state.isGuesserPhase {
		if choices, ok := state.guesserWordChoices[player.ID]; ok {
			if _, chosen := state.guesserChosenWords[player.ID]; !chosen {
				timeLeft := int(state.guesserPhaseEndTime.UnixMilli() - getTimeAsMillis())
				if timeLeft > 0 {
					drawer := lobby.getDrawer()
					drawerName := ""
					if drawer != nil {
						drawerName = drawer.Name
					}
					_ = lobby.WriteObject(player, &Event{
						Type: EventTypeSuggestWords,
						Data: &SuggestWords{
							Words:           choices,
							PreSelectedWord: state.guesserPreSelectedWords[player.ID],
							TimeLeft:        timeLeft,
							DrawerName:      drawerName,
						},
					})
				}
			}
		}
	}
}

func (g *GuesserSuggestionsModeHandler) OnPlayerDisconnect(lobby *Lobby, player *Player) {
	state := getGuesserState(lobby)
	if state.isGuesserPhase {
		eligible := lobby.GetEligibleGuessers()
		allDone := true
		for _, guesser := range eligible {
			if _, chosen := state.guesserChosenWords[guesser.ID]; !chosen {
				allDone = false
				break
			}
		}
		if allDone && len(eligible) > 0 {
			g.transitionToDrawerWordChoice(lobby)
		}
	}
}

func (g *GuesserSuggestionsModeHandler) handleGuesserWordChoice(lobby *Lobby, player *Player, index int) error {
	lobby.mutex.Lock()
	defer lobby.mutex.Unlock()

	state := getGuesserState(lobby)
	if !state.isGuesserPhase {
		return errors.New("word choice submitted outside guesser phase")
	}

	choices, ok := state.guesserWordChoices[player.ID]
	if !ok || index < 0 || index >= len(choices) {
		return fmt.Errorf("invalid guesser word choice index: %d", index)
	}

	state.guesserChosenWords[player.ID] = choices[index]

	eligible := lobby.GetEligibleGuessers()
	allDone := true
	for _, guesser := range eligible {
		if _, chosen := state.guesserChosenWords[guesser.ID]; !chosen {
			allDone = false
			break
		}
	}

	if allDone && len(eligible) > 0 {
		g.transitionToDrawerWordChoice(lobby)
	}

	return nil
}

func (g *GuesserSuggestionsModeHandler) transitionToDrawerWordChoice(lobby *Lobby) {
	state := getGuesserState(lobby)
	state.isGuesserPhase = false

	var wordsForDrawer []string
	wordSet := make(map[string]bool)
	for _, word := range state.guesserChosenWords {
		trimmed := strings.TrimSpace(word)
		if trimmed != "" && !wordSet[trimmed] {
			wordSet[trimmed] = true
			wordsForDrawer = append(wordsForDrawer, trimmed)
		}
	}

	needed := lobby.WordsPerTurn - len(wordsForDrawer)
	if needed > 0 {
		extras := GetRandomWords(needed, lobby)
		for _, w := range extras {
			trimmed := strings.TrimSpace(w)
			if !wordSet[trimmed] && trimmed != "" {
				wordSet[trimmed] = true
				wordsForDrawer = append(wordsForDrawer, trimmed)
			}
		}
	}

	if len(wordsForDrawer) == 0 {
		wordsForDrawer = GetRandomWords(lobby.WordsPerTurn, lobby)
	}

	lobby.wordChoice = wordsForDrawer
	lobby.preSelectedWord = rand.IntN(len(lobby.wordChoice))
	drawerDuration := 25
	lobby.wordChoiceEndTime = time.Now().Add(time.Duration(drawerDuration) * time.Second)

	drawer := lobby.getDrawer()
	if drawer != nil {
		lobby.SendYourTurnEvent(drawer)
		lobby.broadcastConditional(&Event{
			Type: EventTypeNextTurn,
			Data: &NextTurn{
				Round:          lobby.Round,
				Players:        lobby.players,
				ChoiceTimeLeft: drawerDuration * 1000,
				GuesserPhase:   false,
				GameMode:       g.ID(),
			},
		}, ExcludePlayer(drawer))
	}
}
