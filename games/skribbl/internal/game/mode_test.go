package game

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGameModeRegistry(t *testing.T) {
	modes := SupportedGameModes()
	assert.Contains(t, modes, WordSelectModeClassic)
	assert.Contains(t, modes, WordSelectModeGuesserSuggestions)
	assert.Contains(t, modes, GameModeBlindDrawer)
	assert.Contains(t, modes, GameModeSpeedDrawing)

	all := AllGameModes()
	assert.GreaterOrEqual(t, len(all), 4)

	classic := GetGameMode(WordSelectModeClassic)
	assert.NotNil(t, classic)
	assert.Equal(t, WordSelectModeClassic, classic.ID())

	// Fallback to classic
	unknown := GetGameMode("non_existent_mode_xyz")
	assert.NotNil(t, unknown)
	assert.Equal(t, WordSelectModeClassic, unknown.ID())
}

func TestParseModeID(t *testing.T) {
	tests := []struct {
		input       string
		expected    string
		expectError bool
	}{
		{"", WordSelectModeClassic, false},
		{"classic", WordSelectModeClassic, false},
		{"drawer", WordSelectModeClassic, false},
		{"guesser_suggestions", WordSelectModeGuesserSuggestions, false},
		{"suggest", WordSelectModeGuesserSuggestions, false},
		{"blind", GameModeBlindDrawer, false},
		{"blind_drawer", GameModeBlindDrawer, false},
		{"speed", GameModeSpeedDrawing, false},
		{"speed_drawing", GameModeSpeedDrawing, false},
		{"blitz", GameModeSpeedDrawing, false},
		{"invalid_mode_123", "", true},
	}

	for _, tt := range tests {
		actual, err := ParseModeID(tt.input)
		if tt.expectError {
			assert.Error(t, err, "expected error for %s", tt.input)
		} else {
			assert.NoError(t, err, "unexpected error for %s", tt.input)
			assert.Equal(t, tt.expected, actual)
		}
	}
}

type testCustomMode struct {
	BaseGameMode
}

func (m *testCustomMode) ID() string             { return "test_custom_mode" }
func (m *testCustomMode) NameKey() string        { return "mode-test-custom-name" }
func (m *testCustomMode) DescriptionKey() string { return "mode-test-custom-desc" }

func TestCustomModeRegisterAndLifecycle(t *testing.T) {
	custom := &testCustomMode{}
	RegisterGameMode(custom)

	retrieved := GetGameMode("test_custom_mode")
	assert.Equal(t, "test_custom_mode", retrieved.ID())
	assert.Equal(t, "mode-test-custom-name", retrieved.NameKey())
	assert.Equal(t, "mode-test-custom-desc", retrieved.DescriptionKey())

	// Test BaseGameMode default implementations
	assert.Nil(t, retrieved.NewState())
	assert.False(t, retrieved.OnTick(nil))
	handled, err := retrieved.HandleEvent(nil, nil, "some-event", nil)
	assert.False(t, handled)
	assert.NoError(t, err)
	assert.Equal(t, 120, retrieved.ModifyDrawingDuration(nil, 120))
}

func TestSpeedDrawingDuration(t *testing.T) {
	speedMode := GetGameMode(GameModeSpeedDrawing)
	assert.NotNil(t, speedMode)

	lobby := &Lobby{
		EditableLobbySettings: EditableLobbySettings{
			DrawingTime:    80,
			WordSelectMode: GameModeSpeedDrawing,
		},
	}

	effective := lobby.GetEffectiveDrawingTime()
	assert.Equal(t, 40, effective)

	// Min bound check
	lobby.DrawingTime = 20
	effectiveMin := lobby.GetEffectiveDrawingTime()
	assert.Equal(t, 20, effectiveMin)
}

func TestBlindDrawerShouldNotReceiveDrawing(t *testing.T) {
	blindMode := GetGameMode(GameModeBlindDrawer)
	assert.NotNil(t, blindMode)
	assert.False(t, blindMode.ShouldDrawerReceiveDrawing())

	classicMode := GetGameMode(WordSelectModeClassic)
	assert.NotNil(t, classicMode)
	assert.True(t, classicMode.ShouldDrawerReceiveDrawing())

	speedMode := GetGameMode(GameModeSpeedDrawing)
	assert.NotNil(t, speedMode)
	assert.True(t, speedMode.ShouldDrawerReceiveDrawing())

	guesserMode := GetGameMode(WordSelectModeGuesserSuggestions)
	assert.NotNil(t, guesserMode)
	assert.True(t, guesserMode.ShouldDrawerReceiveDrawing())

	// Verify ready event current drawing filtering
	lobby := &Lobby{
		EditableLobbySettings: EditableLobbySettings{
			WordSelectMode: GameModeBlindDrawer,
		},
		currentDrawing: []any{"stroke1", "stroke2"},
	}
	drawerPlayer := &Player{
		State: Drawing,
	}
	guesserPlayer := &Player{
		State: Guessing,
	}

	readyDrawer := generateReadyData(lobby, drawerPlayer)
	assert.Nil(t, readyDrawer.CurrentDrawing, "blind drawer should not receive current drawing")

	readyGuesser := generateReadyData(lobby, guesserPlayer)
	assert.NotNil(t, readyGuesser.CurrentDrawing, "guesser should receive current drawing")
}

