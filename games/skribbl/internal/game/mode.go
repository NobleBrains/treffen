package game

import (
	"fmt"
	"strings"
	"sync"
)

// GameModeInfo contains user-facing metadata for UI display, templates, and API responses.
type GameModeInfo struct {
	ID             string `json:"id"`
	NameKey        string `json:"nameKey"`
	DescriptionKey string `json:"descriptionKey"`
}

// GameModeHandler defines the interface for modular game modes in Skribbol.
// Any new game mode can be added by implementing this interface and calling RegisterGameMode.
// Handlers can embed BaseGameMode to inherit default implementations for optional hooks.
type GameModeHandler interface {
	// ID returns the unique identifier for this game mode (e.g. "classic", "guesser_suggestions", "blind_drawer").
	ID() string

	// NameKey returns the translation key for the UI display name.
	NameKey() string

	// DescriptionKey returns the translation key for the UI description / explanation.
	DescriptionKey() string

	// NewState allocates and returns the mode-specific state for a lobby (or nil if none is needed).
	NewState() any

	// StartTurn initiates the turn phase (e.g. word selection or guesser proposals).
	StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason)

	// OnTick is invoked every second of the turn timer.
	// Returns true if the tick was handled by this mode's prelude/custom phase,
	// or false to let normal turn/drawing timer tick logic proceed.
	OnTick(lobby *Lobby) bool

	// HandleEvent processes mode-specific WebSocket events.
	// Returns handled=true if this mode processed the event.
	HandleEvent(lobby *Lobby, player *Player, eventType string, payload []byte) (handled bool, err error)

	// OnPlayerConnect synchronizes any active mode-specific state with a newly connected/reconnected player.
	OnPlayerConnect(lobby *Lobby, player *Player)

	// OnPlayerDisconnect handles player disconnection during active game mode phases.
	OnPlayerDisconnect(lobby *Lobby, player *Player)

	// OnGameStart is invoked when the game begins or restarts.
	OnGameStart(lobby *Lobby)

	// OnTurnEnd is invoked when a drawing turn finishes.
	OnTurnEnd(lobby *Lobby)

	// OnRoundEnd is invoked when a full round finishes.
	OnRoundEnd(lobby *Lobby)

	// OnGameOver is invoked when the game ends.
	OnGameOver(lobby *Lobby)

	// ModifyDrawingDuration allows the mode to adjust the drawing turn duration (e.g. speed modes).
	ModifyDrawingDuration(lobby *Lobby, baseDuration int) int

	// ShouldDrawerReceiveDrawing returns whether the active drawer receives drawing updates (e.g. on undo or reconnect).
	// When false (e.g. blind drawing mode), canvas stroke data is withheld from the drawer.
	ShouldDrawerReceiveDrawing() bool
}

// BaseGameMode provides sensible default implementations for optional hooks,
// making it very easy to implement new game modes without boilerplate.
type BaseGameMode struct{}

func (b *BaseGameMode) ID() string             { return "" }
func (b *BaseGameMode) NameKey() string        { return "" }
func (b *BaseGameMode) DescriptionKey() string { return "" }
func (b *BaseGameMode) StartTurn(lobby *Lobby, newDrawer *Player, previousWord string, currentRoundEndReason roundEndReason) {
	(&ClassicModeHandler{}).StartTurn(lobby, newDrawer, previousWord, currentRoundEndReason)
}
func (b *BaseGameMode) NewState() any          { return nil }
func (b *BaseGameMode) OnTick(lobby *Lobby) bool                                          { return false }
func (b *BaseGameMode) HandleEvent(lobby *Lobby, player *Player, eventType string, payload []byte) (bool, error) {
	return false, nil
}
func (b *BaseGameMode) OnPlayerConnect(lobby *Lobby, player *Player)                      {}
func (b *BaseGameMode) OnPlayerDisconnect(lobby *Lobby, player *Player)                   {}
func (b *BaseGameMode) OnGameStart(lobby *Lobby)                                           {}
func (b *BaseGameMode) OnTurnEnd(lobby *Lobby)                                             {}
func (b *BaseGameMode) OnRoundEnd(lobby *Lobby)                                            {}
func (b *BaseGameMode) OnGameOver(lobby *Lobby)                                            {}
func (b *BaseGameMode) ModifyDrawingDuration(lobby *Lobby, baseDuration int) int          { return baseDuration }
func (b *BaseGameMode) ShouldDrawerReceiveDrawing() bool                                  { return true }

var (
	gameModeRegistryMutex sync.RWMutex
	gameModeRegistry      = make(map[string]GameModeHandler)
	gameModeOrder         []string
)

// RegisterGameMode registers a GameModeHandler.
func RegisterGameMode(handler GameModeHandler) {
	gameModeRegistryMutex.Lock()
	defer gameModeRegistryMutex.Unlock()

	id := handler.ID()
	if _, exists := gameModeRegistry[id]; !exists {
		gameModeOrder = append(gameModeOrder, id)
	}
	gameModeRegistry[id] = handler
}

// GetGameMode retrieves a registered GameModeHandler by its ID.
// Falls back to Classic mode if the ID is not found.
func GetGameMode(id string) GameModeHandler {
	gameModeRegistryMutex.RLock()
	defer gameModeRegistryMutex.RUnlock()

	if handler, exists := gameModeRegistry[id]; exists {
		return handler
	}
	return gameModeRegistry[WordSelectModeClassic]
}

// AllGameModes returns metadata for all registered game modes with classic first.
func AllGameModes() []GameModeInfo {
	gameModeRegistryMutex.RLock()
	defer gameModeRegistryMutex.RUnlock()

	orderedIDs := make([]string, 0, len(gameModeOrder))
	if _, exists := gameModeRegistry[WordSelectModeClassic]; exists {
		orderedIDs = append(orderedIDs, WordSelectModeClassic)
	}
	for _, id := range gameModeOrder {
		if id != WordSelectModeClassic {
			orderedIDs = append(orderedIDs, id)
		}
	}

	result := make([]GameModeInfo, 0, len(orderedIDs))
	for _, id := range orderedIDs {
		handler := gameModeRegistry[id]
		result = append(result, GameModeInfo{
			ID:             handler.ID(),
			NameKey:        handler.NameKey(),
			DescriptionKey: handler.DescriptionKey(),
		})
	}
	return result
}

// SupportedGameModes returns a list of all registered game mode IDs with classic first.
func SupportedGameModes() []string {
	gameModeRegistryMutex.RLock()
	defer gameModeRegistryMutex.RUnlock()

	orderedIDs := make([]string, 0, len(gameModeOrder))
	if _, exists := gameModeRegistry[WordSelectModeClassic]; exists {
		orderedIDs = append(orderedIDs, WordSelectModeClassic)
	}
	for _, id := range gameModeOrder {
		if id != WordSelectModeClassic {
			orderedIDs = append(orderedIDs, id)
		}
	}
	return orderedIDs
}

// GetGameMode returns the active GameModeHandler for the lobby.
func (lobby *Lobby) GetGameMode() GameModeHandler {
	return GetGameMode(lobby.WordSelectMode)
}

// GetEffectiveDrawingTime returns the adjusted drawing time taking the game mode into account.
func (lobby *Lobby) GetEffectiveDrawingTime() int {
	if lobby.DrawingTime <= 0 {
		return 60
	}
	effective := lobby.GetGameMode().ModifyDrawingDuration(lobby, lobby.DrawingTime)
	if effective < 10 {
		return 10
	}
	return effective
}

// ParseModeID validates a mode ID against the registry.
func ParseModeID(value string) (string, error) {
	toLower := strings.ToLower(strings.TrimSpace(value))
	switch toLower {
	case "", "classic", "drawer":
		return WordSelectModeClassic, nil
	case "guesser_suggestions", "guessers", "suggest":
		return WordSelectModeGuesserSuggestions, nil
	case "blind", "blind_drawer":
		return GameModeBlindDrawer, nil
	case "speed", "speed_drawing", "blitz":
		return GameModeSpeedDrawing, nil
	}

	gameModeRegistryMutex.RLock()
	defer gameModeRegistryMutex.RUnlock()
	if _, exists := gameModeRegistry[toLower]; exists {
		return toLower, nil
	}

	return "", fmt.Errorf("the given game mode '%s' is not supported", value)
}
